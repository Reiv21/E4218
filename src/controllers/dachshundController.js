const dachshundModel = require('../models/dachshund');
const crypto = require('crypto');
const { buildFilterSortFromParams, allowedBreeds, allowedStatus } = require('../utils/queryHelper');

// Render index page for dachshunds
async function index(req, res) {
    try {
        const { filter, sort } = buildFilterSortFromParams(req.query);
        const dachshunds = await dachshundModel.getAllDachshunds(filter, sort);
        res.render('dachshund/index', { dachshunds, query: req.query });
    } catch (err) {
        console.error('Błąd podczas pobierania jamników:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}

async function newForm(req, res) {
    // always pass empty values/errors to simplify templates
    res.render('dachshund/new', { values: {}, errors: {} });
}

// Create a new dachshund (hash password if provided)
async function create(req, res) {
    try {
        const { name, age, breed, description, status, password } = req.body;
        const errors = {};
        // Validation: required fields
        if (!name || !name.trim()) errors.name = 'Nazwa nie może być pusta';
        if (!breed || !breed.trim()) {
            errors.breed = 'Rasa nie może być pusta';
        } else if (!allowedBreeds.includes(breed.trim())) {
            errors.breed = 'Nieprawidłowa rasa';
        }
        if (!status || !status.trim()) errors.status = 'Status nie może być pusty';
        else if (!allowedStatus.includes(status.trim())) errors.status = 'Nieprawidłowy status';
        // age must be provided and be a non-negative integer
        let numericAge;
        if (age === undefined || age === '') {
            errors.age = 'Wiek musi być podany';
        } else {
            numericAge = Number(age);
            if (Number.isNaN(numericAge) || numericAge < 0) errors.age = 'Wiek musi być liczbą nieujemną';
        }
        // password if provided: minimum length
        if (password && password.length > 0 && password.length < 6) errors.password = 'Hasło musi mieć minimum 6 znaków';

        if (Object.keys(errors).length > 0) {
            // re-render new form with submitted values and errors
            return res.status(400).render('dachshund/new', { values: req.body, errors });
        }

        const dachshund = { name: name.trim(), age: numericAge, breed: breed.trim(), description, status: status && status.trim() };
        if (password) {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            dachshund.passwordHash = hash;
        }
        await dachshundModel.addDachshund(dachshund);
        res.redirect('/');
    } catch (err) {
        console.error('Błąd przy tworzeniu jamnika:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}
async function show(req, res) {
    try {
        const dachshund = await dachshundModel.getDachshundById(req.params.id);
        if (!dachshund) return res.status(404).send('Nie znaleziono jamnika');
        res.render('dachshund/show', { dachshund });
    } catch (err) {
        console.error('Błąd przy pobieraniu jamnika:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}

// Edit form
async function editForm(req, res) {
    try {
        const dachshund = await dachshundModel.getDachshundById(req.params.id);
        if (!dachshund) return res.status(404).send('Nie znaleziono jamnika');
        res.render('dachshund/edit', { dachshund, errors: {}, error: null });
    } catch (err) {
        console.error('Błąd przy pobieraniu jamnika do edycji:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}

// Update dachshund (requires password if set; supports changing password)
async function update(req, res) {
    try {
    const { name, age, breed, description, status } = req.body;
        // Fetch existing doc to verify password if set
        const existing = await dachshundModel.getDachshundById(req.params.id);
        if (!existing) return res.status(404).send('Nie znaleziono jamnika');

        const errors = {};
        // Validate required fields
        if (!name || !name.trim()) errors.name = 'Nazwa nie może być pusta';
        if (!breed || !breed.trim()) {
            errors.breed = 'Rasa nie może być pusta';
        } else if (!allowedBreeds.includes(breed.trim())) {
            errors.breed = 'Nieprawidłowa rasa';
        }
        if (!status || !status.trim()) errors.status = 'Status nie może być pusty';
        else if (!allowedStatus.includes(status.trim())) errors.status = 'Nieprawidłowy status';
        // age must be provided and be a non-negative integer
        let numericAge;
        if (age === undefined || age === '') {
            errors.age = 'Wiek musi być podany';
        } else {
            numericAge = Number(age);
            if (Number.isNaN(numericAge) || numericAge < 0) errors.age = 'Wiek musi być liczbą nieujemną';
        }

        const updateObj = { name: name && name.trim(), age: numericAge, breed: breed && breed.trim(), description, status };
        const providedPassword = req.body.password;
        const newPassword = req.body.newPassword;

        // Validate newPassword if provided
        if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
            errors.newPassword = 'Nowe hasło musi mieć minimum 6 znaków';
        }

        if (Object.keys(errors).length > 0) {
            // re-render edit with submitted values and errors
            const dachshund = Object.assign({ _id: req.params.id }, updateObj);
            return res.status(400).render('dachshund/edit', { dachshund, error: null, errors });
        }

        if (existing.passwordHash) {
            if (!providedPassword) {
                // Re-render edit form with submitted values and an error
                const dachshund = Object.assign({ _id: req.params.id }, updateObj);
                return res.status(403).render('dachshund/edit', { dachshund, error: 'Hasło wymagane do edycji', errors: {} });
            }
            const hash = crypto.createHash('sha256').update(providedPassword).digest('hex');
            if (hash !== existing.passwordHash) {
                const dachshund = Object.assign({ _id: req.params.id }, updateObj);
                return res.status(403).render('dachshund/edit', { dachshund, error: 'Nieprawidłowe hasło', errors: {} });
            }
        }

        // If user provided newPassword, update hash
        if (newPassword) {
            updateObj.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
        }

        // Remove undefined fields so $set doesn't clear them
        Object.keys(updateObj).forEach(k => updateObj[k] === undefined && delete updateObj[k]);
        await dachshundModel.updateDachshund(req.params.id, updateObj);
        res.redirect('/');
    } catch (err) {
        console.error('Błąd przy aktualizacji jamnika:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}

// Delete dachshund (requires password if set)
async function remove(req, res) {
    try {
        const providedPassword = req.body.password;
        const existing = await dachshundModel.getDachshundById(req.params.id);
        if (!existing) return res.status(404).send('Nie znaleziono jamnika');

        if (existing.passwordHash) {
            if (!providedPassword) {
                // rebuild filter/sort from hidden inputs and re-render
                const { filter, sort } = buildFilterSortFromParams(req.body);
                const dachshunds = await dachshundModel.getAllDachshunds(filter, sort);
                const errors = {};
                errors[req.params.id] = 'Hasło wymagane do usunięcia';
                return res.status(403).render('dachshund/index', { dachshunds, errors, query: req.body });
            }
            const hash = crypto.createHash('sha256').update(providedPassword).digest('hex');
            if (hash !== existing.passwordHash) {
                const { filter, sort } = buildFilterSortFromParams(req.body);
                const dachshunds = await dachshundModel.getAllDachshunds(filter, sort);
                const errors = {};
                errors[req.params.id] = 'Nieprawidłowe hasło';
                return res.status(403).render('dachshund/index', { dachshunds, errors, query: req.body });
            }
        }

        await dachshundModel.deleteDachshund(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.error('Błąd przy usuwaniu jamnika:', err);
        res.status(500).send('Wystąpił błąd serwera');
    }
}

module.exports = {
    index,
    newForm,
    create,
    show,
    editForm,
    update,
    delete: remove
};
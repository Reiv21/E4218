// Helper to build Mongo filters and sort objects from request params
function buildFilterSortFromParams(params) {
  const { name, breed, status, minAge, maxAge, sortBy, order } = params || {};
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (breed) filter.breed = { $regex: breed, $options: 'i' };
  if (status) filter.status = status;
  if (minAge) filter.age = Object.assign(filter.age || {}, { $gte: Number(minAge) });
  if (maxAge) filter.age = Object.assign(filter.age || {}, { $lte: Number(maxAge) });

  let sort = null;
  if (sortBy) {
    const dir = order === 'desc' ? -1 : 1;
    if (['name', 'age', 'breed', 'status'].includes(sortBy)) {
      sort = { [sortBy]: dir };
    }
  }

  return { filter, sort };
}

const allowedBreeds = ['jamnik krotkowlosy', 'jamnik dlugowlosy'];
const allowedStatus = ['dostępny', 'adoptowany'];

module.exports = { buildFilterSortFromParams, allowedBreeds, allowedStatus };

Jamniki — aplikacja Express + EJS

Prosta aplikacja do zarządzania listą jamników (dachshunds). Backend w Node.js/Express, widoki EJS, dane przechowywane w MongoDB.

## Funkcjonalności
- Lista jamników z filtrowaniem (GET) i sortowaniem
- Dodawanie nowego jamnika (formularz)
- Edycja i usuwanie jamnika (jeżeli jamnik ma ustawione hasło, operacje te wymagają podania hasła)
- Walidacja serwerowa pól formularzy (nazwa, rasa, status, wiek)
- Prosty system per-rekordowego hasła

## Wymagania
- Node.js 16+
- MongoDB (kontener Docker, sprawdź docker.txt)
- Git

## Instalacja
1. Sklonuj repozytorium:

```bash
git clone https://github.com/Reiv21/E4_2_18
cd E4_2_18
```

2. Zainstaluj zależności:

```bash
npm install
```

## Uruchomienie 

Wejdź do katalogu projektu i w terminalu wpisz:
```bash
npm start
```

Serwer uruchomi się domyślnie na http://localhost:3000 (wyświetli się komunikat w konsoli po nawiązaniu połączenia z MongoDB).

## Endpoints / Widoki
- GET `/` — lista jamników, formularz GET do filtrowania i sortowania
- GET `/new` — formularz dodawania
- POST `/new` — tworzenie nowego jamnika (pole `password` opcjonalne)
- GET `/:id` — widok szczegółów jamnika
- GET `/:id/edit` — formularz edycji
- POST `/:id` — aktualizacja (jeśli rekord ma hasło, wymagane obecne hasło; opcjonalne nowe hasło `newPassword`)
- POST `/:id/delete` — usunięcie rekordu (jeśli rekord ma hasło, wymagane podanie hasła)

Formularze używają kodowania `application/x-www-form-urlencoded` (standardowe formularze HTML).

## Konfiguracja bazy (Docker)

Sprawdź plik docker.txt

## Licencja
Projekt jest na licencji MIT — plik `LICENSE` zawiera pełny tekst.

## Autor
Justyn Odyjas

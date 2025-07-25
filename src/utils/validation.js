// src/utils/validation.js

/**
 * Controleert of een string een geldige Nederlandse postcode is.
 * Formaat: 1234 AB (spatie is optioneel).
 * @param {string} postalCode De te controleren postcode.
 * @returns {boolean} True als de postcode geldig is, anders false.
 */
export const isValidDutchPostalCode = (postalCode) => {
  if (!postalCode) return true; // Leeg veld is geen fout
  const regex = /^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i;
  return regex.test(postalCode);
};

/**
 * Controleert of een string een geldig Nederlands telefoonnummer is.
 * Herkent formaten als 0612345678, +31612345678, etc.
 * @param {string} phoneNumber Het te controleren telefoonnummer.
 * @returns {boolean} True als het nummer geldig is, anders false.
 */
export const isValidDutchPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return true; // Leeg veld is geen fout
  const regex = /^((\+|00(\s|\s?\-\s?)?31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9])((\s|\s?\-\s?)?[0-9])\s?[0-9\s?\-]{6,7})$/;
  return regex.test(phoneNumber);
};

/**
 * Controleert of een string een geldig IBAN-nummer is via de MOD-97 check.
 * @param {string} iban Het te controleren IBAN-nummer.
 * @returns {boolean} True als het IBAN geldig is, anders false.
 */
export const isValidIBAN = (iban) => {
    if (!iban) return true; // Leeg veld is geen fout
    
    // Verwijder spaties en zet om naar hoofdletters
    const ibanFormatted = iban.replace(/\s/g, '').toUpperCase();

    // Verplaats de eerste 4 karakters naar het einde
    const ibanRearranged = ibanFormatted.substring(4) + ibanFormatted.substring(0, 4);

    // Vervang letters door getallen (A=10, B=11, ...)
    const numericIban = ibanRearranged.split('').map(char => {
        const charCode = char.charCodeAt(0);
        return charCode >= 65 && charCode <= 90 ? charCode - 55 : char;
    }).join('');

    // Voer de MOD-97 check uit met BigInt voor grote getallen
    try {
        return BigInt(numericIban) % 97n === 1n;
    } catch (e) {
        return false;
    }
};

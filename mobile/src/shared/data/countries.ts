export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// "ISO2|Name|DialCode" keeps the source compact; flags are derived from the ISO
// code below rather than pasted in, so they can never drift out of sync.
const RAW = [
  'AF|Afghanistan|+93',
  'AL|Albania|+355',
  'DZ|Algeria|+213',
  'AR|Argentina|+54',
  'AM|Armenia|+374',
  'AU|Australia|+61',
  'AT|Austria|+43',
  'AZ|Azerbaijan|+994',
  'BH|Bahrain|+973',
  'BD|Bangladesh|+880',
  'BY|Belarus|+375',
  'BE|Belgium|+32',
  'BO|Bolivia|+591',
  'BA|Bosnia and Herzegovina|+387',
  'BR|Brazil|+55',
  'BG|Bulgaria|+359',
  'KH|Cambodia|+855',
  'CM|Cameroon|+237',
  'CA|Canada|+1',
  'CL|Chile|+56',
  'CN|China|+86',
  'CO|Colombia|+57',
  'CR|Costa Rica|+506',
  'HR|Croatia|+385',
  'CY|Cyprus|+357',
  'CZ|Czechia|+420',
  'DK|Denmark|+45',
  'DO|Dominican Republic|+1809',
  'EC|Ecuador|+593',
  'EG|Egypt|+20',
  'SV|El Salvador|+503',
  'EE|Estonia|+372',
  'ET|Ethiopia|+251',
  'FI|Finland|+358',
  'FR|France|+33',
  'GE|Georgia|+995',
  'DE|Germany|+49',
  'GH|Ghana|+233',
  'GR|Greece|+30',
  'GT|Guatemala|+502',
  'HN|Honduras|+504',
  'HK|Hong Kong|+852',
  'HU|Hungary|+36',
  'IS|Iceland|+354',
  'IN|India|+91',
  'ID|Indonesia|+62',
  'IQ|Iraq|+964',
  'IE|Ireland|+353',
  'IL|Israel|+972',
  'IT|Italy|+39',
  'JM|Jamaica|+1876',
  'JP|Japan|+81',
  'JO|Jordan|+962',
  'KZ|Kazakhstan|+7',
  'KE|Kenya|+254',
  'KW|Kuwait|+965',
  'KG|Kyrgyzstan|+996',
  'LV|Latvia|+371',
  'LB|Lebanon|+961',
  'LY|Libya|+218',
  'LT|Lithuania|+370',
  'LU|Luxembourg|+352',
  'MY|Malaysia|+60',
  'MV|Maldives|+960',
  'MT|Malta|+356',
  'MU|Mauritius|+230',
  'MX|Mexico|+52',
  'MD|Moldova|+373',
  'MN|Mongolia|+976',
  'ME|Montenegro|+382',
  'MA|Morocco|+212',
  'MM|Myanmar|+95',
  'NP|Nepal|+977',
  'NL|Netherlands|+31',
  'NZ|New Zealand|+64',
  'NG|Nigeria|+234',
  'MK|North Macedonia|+389',
  'NO|Norway|+47',
  'OM|Oman|+968',
  'PK|Pakistan|+92',
  'PS|Palestine|+970',
  'PA|Panama|+507',
  'PY|Paraguay|+595',
  'PE|Peru|+51',
  'PH|Philippines|+63',
  'PL|Poland|+48',
  'PT|Portugal|+351',
  'QA|Qatar|+974',
  'RO|Romania|+40',
  'RU|Russia|+7',
  'RW|Rwanda|+250',
  'SA|Saudi Arabia|+966',
  'SN|Senegal|+221',
  'RS|Serbia|+381',
  'SG|Singapore|+65',
  'SK|Slovakia|+421',
  'SI|Slovenia|+386',
  'ZA|South Africa|+27',
  'KR|South Korea|+82',
  'ES|Spain|+34',
  'LK|Sri Lanka|+94',
  'SD|Sudan|+249',
  'SE|Sweden|+46',
  'CH|Switzerland|+41',
  'SY|Syria|+963',
  'TW|Taiwan|+886',
  'TZ|Tanzania|+255',
  'TH|Thailand|+66',
  'TN|Tunisia|+216',
  'TR|Turkey|+90',
  'UG|Uganda|+256',
  'UA|Ukraine|+380',
  'AE|United Arab Emirates|+971',
  'GB|United Kingdom|+44',
  'US|United States|+1',
  'UY|Uruguay|+598',
  'UZ|Uzbekistan|+998',
  'VE|Venezuela|+58',
  'VN|Vietnam|+84',
  'YE|Yemen|+967',
  'ZM|Zambia|+260',
  'ZW|Zimbabwe|+263',
];

const REGIONAL_INDICATOR_BASE = 0x1f1e6;
const LETTER_A = 'A'.charCodeAt(0);

function flagFor(code: string): string {
  return String.fromCodePoint(
    ...[...code].map((char) => REGIONAL_INDICATOR_BASE + char.charCodeAt(0) - LETTER_A),
  );
}

export const countries: Country[] = RAW.map((entry) => {
  const [code = '', name = '', dialCode = ''] = entry.split('|');
  return { code, name, dialCode, flag: flagFor(code) };
}).sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY_CODE = 'QA';

export function findCountry(code: string): Country | undefined {
  return countries.find((country) => country.code === code);
}

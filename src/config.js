import fs from 'fs';
import yaml from 'yaml';
import logger from './logger';
import faker from 'faker';

const fake = {
  tag: '!Fake',
  resolve: (_doc, cst) => {
    let value = cst.strValue;
    switch (cst.strValue) {
      case 'firstName':
        value = faker.name.firstName();
        break;
      case 'lastName':
        value = faker.name.lastName();
        break;
      case 'fullName':
        value = faker.name.findName();
        break;
      case 'companyName':
        value = faker.company.companyName();
        break;
      case 'email':
        value = faker.internet.email();
        break;
      case 'domainName':
        value = faker.internet.domainName();
        break;
      case 'userName':
        value = faker.internet.userName();
        break;
      case 'sentence':
        value = faker.lorem.sentence();
        break;
      case 'paragraph':
        value = faker.lorem.paragraph();
        break;
      case 'pastDate':
        value = faker.date.past();
        break;
      case 'futureDate':
        value = faker.date.future();
        break;
      case 'streetAddress':
        value = faker.address.streetAddress();
        break;
      case 'zipCode':
        value = faker.address.zipCode();
        break;
      case 'phoneNumber':
        value = faker.phone.phoneNumber();
        break;
    }
    return value;
  }
};

const get = (path = './.mocki/config.yml') => {
  let config;
  let parsedConfig;
  try {
    config = fs.readFileSync(path, 'utf8');
  } catch (err) {
    logger.error(`Error: Failed to read file ${path}`);
    process.exit(0);
  }
  try {
    parsedConfig = yaml.parse(config, { customTags: [fake] });
  } catch (err) {
    logger.error('Error: Failed to parse config - invalid YAML');
    process.exit(0);
  }
  return parsedConfig;
};

export default {
  get
};

import faker from 'faker';
import yaml from 'yaml';

const parse = config => {
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

  return yaml.parse(config, { customTags: [fake] });
};

export default {
  parse
};

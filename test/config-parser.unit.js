import { expect } from 'chai';
import configParser from '../src/config-parser';

describe('config parser unit tests', () => {
  it('should parse simple configuration', () => {
    const simpleConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body:
                message: Hello World!`;
    const result = configParser.parse(simpleConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
  });

  it('should parse configuration with fakes', () => {
    const fakeConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body:
                company: !Fake companyName
                firstName: !Fake firstName
                lastName: !Fake lastName
                fullName: !Fake fullName
                companyName: !Fake companyName
                email: !Fake email
                domainName: !Fake domainName
                userName: !Fake userName
                sentence: !Fake sentence
                paragraph: !Fake paragraph
                pastDate: !Fake pastDate
                futureDate: !Fake futureDate
                streetAddress: !Fake streetAddress
                zipCode: !Fake zipCode
                phoneNumber: !Fake phoneNumber`;
    const result = configParser.parse(fakeConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
    expect(result.endpoints[0].responses[0].body.company).to.be.a('string');
    expect(result.endpoints[0].responses[0].body.company).to.not.contain(
      '!Fake'
    );
  });
});

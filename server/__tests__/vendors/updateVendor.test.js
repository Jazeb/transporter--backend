const request = require('request');
const { PORT, URL } = require('../constant');
const baseUrl = `${URL}:${PORT}`;

test('Update Vendor Profile', (done) => {
    request.put(`${baseUrl}/user/vendor/update`, {
        form: {
            first_name: 'hello', 
            last_name: 'world'
        }
    }, (err, response) => {
        expect(err).toBe(null);
        if(err) return console.error(err);
        if(response.statusCode != 200) return console.error(response.body);
        expect(response.statusCode).toBe(200);
        body = JSON.parse(response.body);
    });
    done();
});
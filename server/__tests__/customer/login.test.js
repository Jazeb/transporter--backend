const { PORT, URL } = require('../constant');
const baseUrl = `${URL}:${PORT}`;

test('Customer Login', (done) => {
    
    let request = require('request');
    let data =  { form:{ phone_no: '1233456' } };

    request.post(`${baseUrl}/user/customer/login`, data, (err, response) => {
        expect(err).toBe(null);
        if(err) return console.error(err);
        else{
            if(response.statusCode != 200) {
                console.log(response.body)
                expect(response.statusCode).toBe(200);
            } 
            body = JSON.parse(response.body);
            expect(body.data.phone_no).toBe(data.form.phone_no);
        }
    });
    done();
});
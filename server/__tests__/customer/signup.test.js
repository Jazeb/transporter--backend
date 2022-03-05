const { PORT, URL } = require('../constant');
const baseUrl = `${URL}:${PORT}`;

test('Customer SignUp', (done) => {
    
    let request = require('request');
    let data =  {
        form:{
            first_name: 'John',
            last_name: 'Gulberg', 
            email:'jazeb@gmail.com', 
            phone_no: '1233456',
            address: 'Islamabad',
        }
    }
    request.post(`${baseUrl}/user/customer/signup`, data, (err, response) => {
        expect(err).toBe(null);
        if(err) return console.error(err);
        else{
            if(response.statusCode !== 200) {
                console.log(response.body)
                expect(response.statusCode).toBe(200);
            } 
            body = JSON.parse(response.body);
            expect(body.data.first_name).toBe(data.form.first_name);
        }
    });
    done();
});
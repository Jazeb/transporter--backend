const request = require('request');
const { PORT, URL } = require('../constant');
const baseUrl = `${URL}:${PORT}`;

test('Place Service Order', (done) => {
    request.post(`${baseUrl}/user/customer/service/place`, {
        form: {
            source: '1232131', 
            destination: '12313141', 
            vehicle_id: 1, 
            capacity: '200_500', 
            payment_method: 'USD',
            truck_name:'Hino'

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
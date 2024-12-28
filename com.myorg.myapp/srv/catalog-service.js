module.exports = (srv) => {
    srv.before('UPDATE', 'Books', (req) => {
        console.log('Update request received:', req.data);
    });

    srv.after('UPDATE', 'Books', (result, req) => {
        console.log('Update completed:', result);
    });
}
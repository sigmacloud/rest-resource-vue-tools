module.exports = {
    'Redirects to Login': function(client) {
        client
            .url('http://localhost:8080')
            .pause(500)
            .assert.urlContains('/login')
            .end()
    },
}

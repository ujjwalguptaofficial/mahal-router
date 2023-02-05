const routesMeta = {
    "dashboard": {
        requireLogin: true,
        clientMeta: {
            title: 'Dashboard Page',
            tags: [
                {
                    name: "description",
                    content: "Dashboard page description"
                },
                {
                    name: "keywords",
                    content: "dashboard, user"
                }
            ]
        }
    }
}

module.exports = { routesMeta }
(function () {

    Vue.component("modal", {
        template: "#modal",
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                username: "",
                date: "",
            };
        }, // Data ending

        props: ["imageid"],

        mounted: function () {
            var self = this;
            axios.get(`/modal/${this.imageid}`).then(function ({ data }) {
                // console.log('Data: ', data);
                self.url = data[0].url;
                self.title = data[0].title;
                self.description = data[0].description;
                self.username = data[0].username;
                self.date = new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "long",
                    timeStyle: "short",
                }).format(new Date(data[0].created_at));
                // self.username = '';
                // self.comment = '';
            });
            // console.log('Comp mounted!!', this.title);
            // console.log('imageId: ', this.imageId);
        }, // Request ending

        watch: {
            imageid: function () {
                console.log('Modal should show new image');
                var self = this;
                axios
                    .get(`/modal/${this.imageid}`)
                    .then(({ data }) => {
                        console.log('data: ', data);
                        self.url = data[0].url;
                        self.title = data[0].title;
                        self.description = data[0].description;
                        self.username = data[0].username;
                        self.date = new Intl.DateTimeFormat("en-GB", {
                            dateStyle: "long",
                            timeStyle: "short",
                        }).format(new Date(data[0].created_at));
                        // self.username = "";
                        // self.comment = "";
                    });
            }
        },

        methods: {
            closeModal: function () {
                this.$emit("close");
            },
        }, // Methods ending
    }); // Component 'modal' ending

    Vue.component("comment-comp", {
        template: "#img-comment",
        data: function () {
            return {
                comments: [],
                username: "",
                comment: "",
            };
        }, // Data ending

        props: ["imageid"],

        mounted: function () {
            var self = this;
            axios.get(`/comments/${this.imageid}`).then(function ({ data }) {
                console.log("Data: ", data);
                self.comments = data;
                self.username = data[0].username;
                self.comment = data[0].comment;
                self.created_at = new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "long",
                    timeStyle: "short",
                }).format(new Date(data[0].created_at));
                self.username = "";
                self.comment = "";
            });
            // console.log('Comp mounted!!', this.title);
            // console.log('imageId: ', this.imageId);
        }, // Request ending

        watch: {
            imageid: function () {
                console.log("Modal should show new image");
                var self = this;
                axios.get(`/comments/${this.imageid}`).then(({ data }) => {
                    self.comments = data;
                    self.username = data[0].username;
                    self.comment = data[0].comment;
                    self.created_at = new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "long",
                        timeStyle: "short",
                    }).format(new Date(data[0].created_at));
                    self.username = '';
                    self.comment = '';
                });
            },
        },

        methods: {
            submitComment: function () {
                var self = this;
                var obj = {
                    username: this.username,
                    comment: this.comment,
                    imageid: this.imageid,
                };
                axios
                    .post("/comment", obj)
                    .then(function ({ data }) {
                        console.log('Response running');
                        obj.id = data.id;
                        obj.comment = data.comment;
                        obj.username = data.username;
                        obj.created_at = new Intl.DateTimeFormat("en-GB", {
                            dateStyle: "long",
                            timeStyle: "short",
                        }).format(new Date(data.created_at));
                        self.comments.push(obj);
                        self.username = '';
                        self.comment = '';
                    })
                    .catch(function (err) {
                        console.log("Error in postComment: ", err);
                    });

                // this.$emit('submitComment');
            },
        }, // Methods ending
    });

    // Main Vue
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            selectedImage: location.hash.slice(1),
            lastImage: 0,
            more: true
        }, // Data ending

        mounted: function () {
            // Db requests
            var self = this;
            addEventListener('hashchange', () => {
                // console.log('hash updated: ', location.hash);
                this.selectedImage = location.hash.slice(1);
            });

            axios
                .get("/images")
                .then(function ({ data }) {
                    self.images = data;
                    self.lastImage = self.images[self.images.length - 1].id;
                    // self.images.concat(data);
                    // console.log("Data: ", data);
                })
                .catch((err) => console.log("err", err));
        }, // Request ending

        methods: {
            closeModal: function () {
                location.hash = '';
                this.selectedImage = null;
                this.username = '';
                this.comment = '';
                // history.pushState({}, '', '/');
            },
            postContent: function () {
                const fd = new FormData();
                fd.append("title", this.title);
                fd.append("description", this.description);
                fd.append("username", this.username);
                fd.append("file", this.file);
                axios
                    .post("/upload", fd)
                    .then(({ data }) => this.images.unshift(data))
                    .catch((err) => console.log("err: ", err));
            },

            showMore: function () {
                this.lastImage = this.images[this.images.length - 1].id;
                var self = this;
                axios
                    .get(`/more/${this.lastImage}`)
                    .then(function ({ data }) {
                        console.log('LastImage: ', self.lastImage);
                        console.log("Lowest Id: ", data[0].lowestId);
                        
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].id === data[i].lowestId) {
                                self.more = false;
                            }
                        }
                        self.images = [...self.images, ...data];
                    });  
            },

            fileSelect: function (e) {
                this.file = e.target.files[0];
            },
        }, // Methods ending
    });

})();


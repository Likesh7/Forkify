export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike( id, title, author, image ) {
        const like = { id, title, author, image };
        this.likes.push(like);
        
        // Persist data to storage
        this.persistData();

        return like;

    }

    deleteLike(id) {
        const index = this.likes.findIndex( el => el.id === id );
        this.likes.splice(index, 1);

        // Persist data to storage
            this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex( el => el.id === id ) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const stor = JSON.parse(localStorage.getItem('likes'));
        
        // Restoring likes from the storage
        if (stor) this.likes = stor;
    }
}
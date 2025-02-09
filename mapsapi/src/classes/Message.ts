import exp from "constants";

enum Sender {
  User = "user",
  AI = "ai",
  Doc = "doc",
}

class Message {
    constructor(
        private id: Number,
        private message: string,
        private imageData: string | null,
        private sender: Sender,
        private time: Date
    ) {}

    getId() {
        return this.id;
    }

    getMessage() {
        return this.message;
    }

    getSender() {
        return this.sender;
    }

    getTime() {
        return this.time;
    }
    getAlignment() {
        return {justifyContent: this.sender === Sender.User ? "flex-end" : "flex-start"};
    }

    getImage(){
        return this.imageData;
    }

    getColor() {
        return {
            backgroundColor: this.sender === Sender.User ? "#1E90FF" : "#00FF00",
            color: this.sender === Sender.User ? "#000000" : "#000000"
        };
    }
}

export { Message, Sender };
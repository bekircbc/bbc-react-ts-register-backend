export const getUsers = () => {
    return [
        {
            username: "anonymousUser",
            firstName: "Anonymous",
            lastName: "User",
            accessGroups: ["loggedOutUsers"],
        },
        {
            username: "hd",
            firstName: "Hendrick",
            lastName: "Denzmann",
            accessGroups: ["loggedInUsers", "members"],
        },
        {
            username: "an",
            firstName: "Andrea",
            lastName: "Netzelbach",
            accessGroups: ["loggedInUsers", "members"],
        },
    ];
};

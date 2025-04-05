import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { events, locations, users, participants } from "./data.js";
import { nanoid } from "nanoid";

const typeDefs = gql`
  # Event
  type Event {
    id: ID!
    title: String!
    desc: String!
    date: String!
    from: String!
    to: String!
    location_id: ID!
    user_id: ID!
    user: User!
    location: Location!
    participants: [Participant!]!
  }

  input CreateEventInput {
    title: String!
    desc: String
    date: String!
    from: String!
    to: String!
    location_id: ID!
    user_id: ID!
  }

  input UpdateEventInput {
    title: String
    desc: String
    date: String
    from: String
    to: String
    location_id: ID
    user_id: ID
  }

  # Location
  type Location {
    id: ID!
    name: String!
    desc: String!
    lat: Float!
    lng: Float!
  }

  input CreateLocationInput {
    name: String!
    desc: String
    lat: Float!
    lng: Float!
  }

  input UpdateLocationInput {
    name: String
    desc: String
    lat: Float
    lng: Float
  }

  # User
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]!
  }

  input CreateUserInput {
    username: String!
    email: String!
  }

  input UpdateUserInput {
    username: String
    email: String
  }

  # Participant
  type Participant {
    id: ID!
    user_id: ID!
    event_id: ID!
    user: User!
    event: Event!
  }

  input CreateParticipantInput {
    user_id: ID!
    event_id: ID!
  }

  input UpdateParticipantInput {
    user_id: ID
    event_id: ID
  }

  type Query {
    # Event
    events: [Event!]!
    event(id: ID!): Event!

    # Location
    locations: [Location!]!
    location(id: ID!): Location!

    # User
    users: [User!]!
    user(id: ID!): User!

    # Participant
    participants: [Participant!]!
    participant(id: ID!): Participant!
  }

  type DeleteAllOutput {
    count: Int!
  }

  type Mutation {
    # Events
    createEvent(data: CreateEventInput): Event!
    updateEvent(id: ID!, data: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Event!
    deleteAllEvents: DeleteAllOutput!

    # Locations
    createLocation(data: CreateLocationInput): Location!
    updateLocation(id: ID!, data: UpdateLocationInput!): Location!
    deleteLocation(id: ID!): Location!
    deleteAllLocations: DeleteAllOutput!

    # Users
    createUser(data: CreateUserInput): User!
    updateUser(id: ID!, data: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
    deleteAllUsers: DeleteAllOutput!

    # Participants
    createParticipant(data: CreateParticipantInput): Participant!
    updateParticipant(id: ID!, data: UpdateParticipantInput!): Participant!
    deleteParticipant(id: ID!): Participant!
    deleteAllParticipants: DeleteAllOutput!
  }
`;

const resolvers = {
  Mutation: {
    // Event
    createEvent: (
      parent,
      { data: { title, desc, date, from, to, location_id, user_id } }
    ) => {
      const event = {
        id: nanoid(),
        title,
        desc,
        date,
        from,
        to,
        location_id,
        user_id,
      };

      events.push(event);

      return event;
    },
    updateEvent: (parent, { id, data }) => {
      const event_index = events.findIndex((event) => event.id === id);

      if (event_index === -1) {
        throw new Error("Event not found");
      }

      const updatedEvent = (events[event_index] = {
        ...events[event_index],
        ...data,
      });

      return updatedEvent;
    },
    deleteEvent: (parent, { id }) => {
      const event_index = events.findIndex((event) => event.id === id);

      if (event_index === -1) {
        throw new Error("Event not found");
      }

      const deletedEvent = events[event_index];

      events.splice(event_index, 1);

      return deletedEvent;
    },
    deleteAllEvents: () => {
      const length = events.length;

      events.splice(0, length);

      return { count: length };
    },

    // Location
    createLocation: (parent, { data: { name, desc, lat, lng } }) => {
      const location = {
        id: nanoid(),
        name,
        desc,
        lat,
        lng,
      };

      locations.push(location);

      return location;
    },
    updateLocation: (parent, { id, data }) => {
      const location_index = locations.findIndex(
        (location) => location.id === id
      );

      if (location_index === -1) {
        throw new Error("Location not found");
      }

      const updatedLocation = (locations[location_index] = {
        ...locations[location_index],
        ...data,
      });

      return updatedLocation;
    },
    deleteLocation: (parent, { id }) => {
      const location_index = locations.findIndex(
        (location) => location.id === id
      );

      if (location_index === -1) {
        throw new Error("Location not found");
      }

      const deletedLocation = locations[location_index];

      locations.splice(location_index, 1);

      return deletedLocation;
    },
    deleteAllLocations: () => {
      const length = locations.length;

      locations.splice(0, length);

      return { count: length };
    },

    // User
    createUser: (parent, { data: { username, email } }) => {
      const user = {
        id: nanoid(),
        username,
        email,
      };

      users.push(user);

      return user;
    },
    updateUser: (parent, { id, data }) => {
      const user_index = users.findIndex((user) => user.id === id);

      if (user_index === -1) {
        throw new Error("User not found");
      }

      const updatedUser = (users[user_index] = {
        ...users[user_index],
        ...data,
      });

      return updatedUser;
    },
    deleteUser: (parent, { id }) => {
      const user_index = users.findIndex((user) => user.id === id);

      if (user_index === -1) {
        throw new Error("User not found");
      }

      const deletedUser = users[user_index];

      users.splice(user_index, 1);

      return deletedUser;
    },
    deleteAllUsers: () => {
      const length = users.length;

      users.splice(0, length);

      return { count: length };
    },

    // Participant
    createParticipant: (parent, { data: { user_id, event_id } }) => {
      const participant = {
        id: nanoid(),
        user_id,
        event_id,
      };

      participants.push(participant);

      return participant;
    },
    updateParticipant: (parent, { id, data }) => {
      const participant_index = participants.findIndex(
        (participant) => participant.id === id
      );

      if (participant_index === -1) {
        throw new Error("Participant not found");
      }

      const updatedParticipant = (participants[participant_index] = {
        ...participants[participant_index],
        ...data,
      });

      return updatedParticipant;
    },
    deleteParticipant: (parent, { id }) => {
      const participant_index = participants.findIndex(
        (participant) => participant.id === id
      );

      if (participant_index === -1) {
        throw new Error("Participant not found");
      }

      const deletedParticipant = participants[participant_index];

      participants.splice(participant_index, 1);

      return deletedParticipant;
    },
    deleteAllParticipants: () => {
      const length = participants.length;

      participants.splice(0, length);

      return { count: length };
    },
  },

  Query: {
    // Event
    events: () => events,
    event: (_, args) => {
      const event = events.find((event) => event.id === args.id);
      if (!event) throw new Error("Event not found");
      return event;
    },

    // Location
    locations: () => locations,
    location: (_, args) => {
      const location = locations.find((location) => location.id === args.id);
      if (!location) throw new Error("Location not found");
      return location;
    },

    // User
    users: () => users,
    user: (_, args) => {
      const user = users.find((user) => user.id === args.id);
      if (!user) throw new Error("User not found");
      return user;
    },

    // Participant
    participants: () => participants,
    participant: (_, args) => {
      const participant = participants.find(
        (participant) => participant.id === args.id
      );
      if (!participant) throw new Error("Participant not found");
      return participant;
    },
  },

  User: {
    events: (parent) => events.filter((event) => event.user_id === parent.id),
  },

  Event: {
    user: (parent) => users.find((user) => user.id === parent.user_id),
    location: (parent) =>
      locations.find((location) => location.id === parent.location_id),
    participants: (parent) =>
      participants.filter((participant) => participant.event_id === parent.id),
  },

  Participant: {
    user: (parent) => users.find((user) => user.id === parent.user_id),
    event: (parent) => events.find((event) => event.id === parent.event_id),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

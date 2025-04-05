import { createServer } from "node:http";
import { createPubSub, createSchema, createYoga } from "graphql-yoga";
import { nanoid } from "nanoid";
import { gql } from "graphql-tag";
import { events, locations, users, participants } from "./data.js";

const pubSub = createPubSub();

const typeDefs = gql`
  # Event
  type Event {
    id: ID!
    title: String
    desc: String
    date: String
    from: String
    to: String
    location_id: ID!
    location: Location
    user_id: ID!
    user: User
    participants: [Participant]
  }
  input CreateEventInput {
    title: String!
    desc: String!
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
    name: String
    desc: String
    lat: Float
    lng: Float
  }
  input CreateLocationInput {
    name: String!
    desc: String!
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
    events: [Event]
    attended_events: [Event]
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
    user: User
    event_id: ID!
    event: Event
  }
  input CreateParticipantInput {
    user_id: ID!
    event_id: ID!
  }
  input UpdateParticipantInput {
    user_id: ID
    event_id: ID
  }

  type DeleteAllOutput {
    count: Int!
  }

  type Query {
    events: [Event]
    event(id: ID!): Event

    locations: [Location]
    location(id: ID!): Location

    users: [User]
    user(id: ID!): User

    participants: [Participant]
    participant(id: ID!): Participant
  }

  type Mutation {
    # Event
    createEvent(data: CreateEventInput!): Event!
    updateEvent(id: ID!, data: UpdateEventInput): Event!
    deleteEvent(id: ID!): Event!
    deleteAllEvents: DeleteAllOutput!
    # User
    createUser(data: CreateUserInput!): User!
    updateUser(id: ID!, data: UpdateUserInput): User!
    deleteUser(id: ID!): User!
    deleteAllUsers: DeleteAllOutput!
    # Location
    createLocation(data: CreateLocationInput!): Location!
    updateLocation(id: ID!, data: UpdateLocationInput): Location!
    deleteLocation(id: ID!): Location!
    deleteAllLocations: DeleteAllOutput
    # Participant
    createParticipant(data: CreateParticipantInput!): Participant!
    updateParticipant(id: ID!, data: UpdateParticipantInput): Participant!
    deleteParticipant(id: ID!): Participant!
    deleteAllParticipants: DeleteAllOutput
  }

  type Subscription {
    # Event
    eventCreated: Event!
    # User
    userCreated: User!
    # Participant
    participantCreated: Participant!
  }
`;

const resolvers = {
  Subscription: {
    // Event
    eventCreated: {
      subscribe: () => pubSub.subscribe("eventCreated"),
      resolve: (payload) => payload,
    },
    // User
    userCreated: {
      subscribe: () => pubSub.subscribe("userCreated"),
      resolve: (payload) => payload,
    },
    // Participant
    participantCreated: {
      subscribe: () => pubSub.subscribe("participantCreated"),
      resolve: (payload) => payload,
    },
  },
  Mutation: {
    // Event
    createEvent: (_, { data }) => {
      const event = { id: nanoid(), ...data };
      events.push(event);
      pubSub.publish("eventCreated", event);
      return event;
    },
    updateEvent: (_, { id, data }) => {
      const eventIndex = events.findIndex(
        (event) => event.id.toString() === id
      );
      if (eventIndex === -1) {
        throw new Error("Event not found.");
      }
      const updatedEvent = (events[eventIndex] = {
        ...events[eventIndex],
        ...data,
      });
      return updatedEvent;
    },
    deleteEvent: (_, { id }) => {
      const eventIndex = events.findIndex(
        (event) => event.id.toString() === id
      );
      if (eventIndex === -1) {
        throw new Error("Event not found.");
      }
      const deletedEvent = events[eventIndex];
      events.splice(eventIndex, 1);
      return deletedEvent;
    },
    deleteAllEvents: () => {
      const length = events.length;
      events.splice(0, length);
      return { count: length };
    },
    // User
    createUser: (_, { data }) => {
      const user = { id: nanoid(), ...data };
      users.push(user);
      pubSub.publish("userCreated", user);
      return user;
    },
    updateUser: (_, { id, data }) => {
      const userIndex = users.findIndex((user) => user.id.toString() === id);
      if (userIndex === -1) {
        throw new Error("User not found.");
      }
      const updatedUser = (users[userIndex] = {
        ...users[userIndex],
        ...data,
      });
      return updatedUser;
    },
    deleteUser: (_, { id }) => {
      const userIndex = users.findIndex((user) => user.id.toString() === id);
      if (userIndex === -1) {
        throw new Error("User not found.");
      }
      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);
      return deletedUser;
    },
    deleteAllUsers: () => {
      const length = users.length;
      users.splice(0, length);
      return { count: length };
    },
    // Location
    createLocation: (_, { data }) => {
      const location = { id: nanoid(), ...data };
      locations.push(location);
      return location;
    },
    updateLocation: (_, { id, data }) => {
      const locationIndex = locations.findIndex(
        (location) => location.id.toString() === id
      );
      if (locationIndex === -1) {
        throw new Error("Location not found.");
      }
      const updatedLocation = (locations[locationIndex] = {
        ...locations[locationIndex],
        ...data,
      });
      return updatedLocation;
    },
    deleteLocation: (_, { id }) => {
      const locationIndex = locations.findIndex(
        (location) => location.id.toString() === id
      );
      if (locationIndex === -1) {
        throw new Error("Location not found.");
      }
      const deletedLocation = locations[locationIndex];
      locations.splice(locationIndex, 1);
      return deletedLocation;
    },
    deleteAllLocations: () => {
      const length = locations.length;
      locations.splice(0, length);
      return { count: length };
    },
    // Participant
    createParticipant: (_, { data }) => {
      const participant = { id: nanoid(), ...data };
      participants.push(participant);
      pubSub.publish("participantCreated", participant);
      return participant;
    },
    updateParticipant: (_, { id, data }) => {
      const participantIndex = participants.findIndex(
        (participant) => participant.id.toString() === id
      );
      if (participantIndex === -1) {
        throw new Error("Participant not found.");
      }
      const updatedParticipant = (participants[participantIndex] = {
        ...participants[participantIndex],
        ...data,
      });
      return updatedParticipant;
    },
    deleteParticipant: (_, { id }) => {
      const participantIndex = participants.findIndex(
        (participant) => participant.id.toString() === id
      );
      if (participantIndex === -1) {
        throw new Error("Participant not found.");
      }
      const deletedParticipant = participants[participantIndex];
      participants.splice(participantIndex, 1);
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
    event: (_, { id }) => {
      const result = events.find((event) => event.id.toString() === id);
      if (!result) {
        throw new Error("Event not found");
      }
      return result;
    },
    //Location
    locations: () => locations,
    location: (_, { id }) => {
      const result = locations.find(
        (location) => location.id.toString() === id
      );
      if (!result) {
        throw new Error("Location not found");
      }
      return result;
    },
    // User
    users: () => users,
    user: (_, { id }) => {
      const result = users.find((user) => user.id.toString() === id);
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    },
    // Participant
    participants: () => participants,
    participant: (_, { id }) => {
      const result = participants.find(
        (participant) => participant.id.toString() === id
      );
      if (!result) {
        throw new Error("Participant not found");
      }
      return result;
    },
  },
  Event: {
    location: (parent) =>
      locations.find(
        (location) => location.id.toString() === parent.location_id.toString()
      ),
    user: (parent) =>
      users.find((user) => user.id.toString() === parent.user_id.toString()),
    participants: (parent) =>
      participants.filter(
        (participant) =>
          participant.event_id.toString() === parent.id.toString()
      ),
  },
  User: {
    events: (parent) =>
      events.filter(
        (event) => event.user_id.toString() === parent.id.toString()
      ),
    attended_events: (parent) => {
      const attendedEvents = participants.filter(
        (participant) => participant.user_id.toString() === parent.id.toString()
      );
      return attendedEvents
        .map((item) =>
          events.find(
            (event) => event.id.toString() === item.event_id.toString()
          )
        )
        .filter(Boolean);
    },
  },
  Participant: {
    user: (parent) =>
      users.find((user) => user.id.toString() === parent.user_id.toString()),
    event: (parent) =>
      events.find(
        (event) => event.id.toString() === parent.event_id.toString()
      ),
  },
};

// Provide your schema
const yoga = createYoga({
  graphqlEndpoint: "/",
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

const server = createServer(yoga);
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000");
});

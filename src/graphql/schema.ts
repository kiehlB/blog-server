import * as user from './resolvers/user';
import * as post from './resolvers/post';
import * as comments from './resolvers/comments';
import merge from 'lodash/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDef = `
  type Query {
    user(id: String, username: String): User!
    users: [User]
    me: User

    post(id: String): Post
    posts(cursor: String, after: String) :[Post]
    searchPosts(searchInput: String):[Post]
    getImageUrl: ImageUrl
    topFivePost(offset: Int, limit: Int): [Post]


    comment: [Comment]
    subcomments(comment_id: String): [Comment]

  }
  type Mutation {
    register(email: String!, username: String!, password: String!): User!
    login(email: String!, password: String!): User!
    createProfile(bio: String , profile_name:String): UserProfile!
    updateProfile(bio: String): UserProfile!
    followUser(username: String!): Followers
    unFollowUser(username: String!): Followers!
    revokeRefreshToken(userId: String!): Boolean
    logout: Boolean

    createPost(
      title: String
      body: String
      tags: String
      thumbnail: String
    ): Post
    editPost(post_id: String, title: String, body: String): Post
    removePost(post_id: String!): Boolean
    likePost(id: String!): Post
    unLikePost(id: String!): Post
    uploadImage(body: String): UploadedImage
    postView(id: String!): Boolean

   
    createComment(post_id: String, text: String, comment_id: String): Comment
    removeComment(id: String!): Boolean
    editComment(id: String, text: String): Comment
  }
`;

const resolvers = {
  Query: {},
  Mutation: {},
};

const schema = makeExecutableSchema({
  typeDefs: [typeDef, user.typeDef, post.typeDef, comments.typeDef],
  resolvers: merge(resolvers, user.resolvers, post.resolvers, comments.resolvers),
});

export default schema;

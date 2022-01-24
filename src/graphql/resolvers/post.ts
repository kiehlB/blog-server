import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { getRepository, getManager } from 'typeorm';
import Post from '../../entity/Post';
import PostLike from '../../entity/PostLike';
import PostScore from '../../entity/PostScore';
import PostReadLog from '../../entity/PostReadLog';
import PostsTags from '../../entity/PostsTags';
import gql from 'graphql-tag';
import { cloudinary } from '../../lib/cloudinary';
import { checkEmpty } from '../../lib/checkString';
import hash from '../../lib/crypto';

export const typeDef = gql`
  scalar Date
  type TransformImageOptionsInput {
    width: Int
    height: Int
    crop: String
  }

  type Post {
    id: String
    title: String
    body: String
    thumbnail: String
    likes: Int
    views: Int
    url: String!
    user: User
    released_at: Date
    created_at: Date
    updated_at: Date
    comments: [PostComment]
    name: String
    tags: Tag
    post_id: String
    liked: Boolean
    hasMore: Boolean
    endCursor: String
  }

  type UploadOptionsInput {
    public_id: String
    folder: String
    use_filename: Boolean
    unique_filename: Boolean
    resource_type: String
    type: String
    access_mode: String
    discard_original_filename: Boolean
    overwrite: Boolean
    tags: [TagInput]
    colors: Boolean
    faces: Boolean
    quality_analysis: Boolean
    cinemegraph_analysis: Boolean
    image_metadata: Boolean
    phash: Boolean
    auto_tagging: Boolean
    categorization: [CategoryInput]
  }
  type CategoryInput {
    name: String
  }
  type TagInput {
    tag_name: String!
  }
  type Tag {
    name: String!
  }
  type UploadedImage {
    public_id: String!
    version: String!
    width: Int!
    height: Int!
    format: String!
    created_at: String!
    resource_type: String!
    tags: [Tag]!
    bytes: Int!
    type: String!
    etag: String!
    url: String!
    secure_url: String!
    signature: String!
    original_filename: String!
  }
  type ImageUrl {
    public_id: [String]
    url: String
  }
  type PostComment {
    id: String!
    text: String
    likes: Int
    has_replies: Boolean
    deleted: Boolean
    user: User
    post_id: String
    reply: String
    replies: [PostComment]
    comment: String
  }
`;

type PostArgs = {
  tags: string;
  title: string;
  body: string;
  thumbnail: string;
};

type PostEditArgs = PostArgs & {
  post_id: string;
};

export const findTag = async (name: string) => {
  const getTag = getRepository(PostsTags);

  const findOneTag = getTag.findOne({
    name,
  });

  const findTagOne = await findOneTag;

  if (findTagOne?.name == name) {
    return null;
  } else {
    const returnName = escape(name).toLowerCase();

    return returnName;
  }
};

export const saveTags = async (name: string) => {};

export const resolvers = {
  Post: {
    user: (parent: Post, __, { loaders }) => {
      if (!parent.user) {
        return loaders.user.load(parent.id);
      }

      return parent.user;
    },
    comments: (parent: Post, _: any, { loaders }) => {
      if (parent.comments) return parent.comments;
      return loaders.comments.load(parent.id);
    },
    liked: async (parent: Post, args: any, { req, res }) => {
      const getPostLike = getRepository(PostLike);
      if (!res.locals.user_id) return false;
      const liked = await getPostLike.findOne({
        post_id: parent.id,
        user_id: res.locals.user_id,
      });
      return !!liked;
    },
    tags: async (parent: Post, __, { loaders }) => {
      return loaders.tags.load(parent.id);
    },
  },
  Query: {
    getImageUrl: async (_, __, { req }) => {
      const { resources } = await cloudinary.search
        .expression('folder:woong')
        .sort_by('public_id', 'desc')
        .max_results(200)
        .execute();

      const publicIds = resources.map((file: { public_id: any }) => file.public_id);

      return {
        public_id: publicIds,
      };
    },

    post: async (_, args, { req }) => {
      const findPost = await getManager()
        .createQueryBuilder(Post, 'post')
        .where('post.id = :id', { id: args.id })
        .leftJoinAndSelect('post.user', 'user')
        .getOne();

      return findPost;
    },

    posts: async (_, { cursor, after }, { req }, { limit = 9 }) => {
      try {
        const query = await getManager()
          .createQueryBuilder(Post, 'post')
          .limit(limit)
          .orderBy('post.released_at', 'DESC')
          .addOrderBy('post.id', 'DESC')
          .leftJoinAndSelect('post.user', 'user');

        // let first = 5;
        // if (limit !== undefined) {
        //   const min = 1;
        //   const max = 25;
        //   if (limit < min || limit > max) {
        //     throw new ApolloError(`Invalid limit value (min: ${min}, max: ${max})`);
        //   }
        //   first = limit;
        // }

        // if (after) {
        //   if (limit !== undefined) {
        //     const index = posts.findIndex(item => item.id === after);
        //     if (index === -1) {
        //       throw new ApolloError(`Invalid after value: cursor not found.`);
        //     }
        //     after = index + 1;
        //     if (after === posts.length) {
        //       throw new ApolloError(
        //         `Invalid after value: no items after provided cursor.`,
        //       );
        //     }
        //   }
        // }

        // const pageInfoPost = posts.slice(after, after + first);

        // const lastName = pageInfoPost[pageInfoPost.length - 1];

        if (cursor) {
          const post = await getRepository(Post).findOne({
            id: cursor,
          });
          if (!post) {
            throw new ApolloError('invalid cursor');
          }
          query.andWhere('post.released_at < :date', {
            date: post.released_at,
            id: post.id,
          });
          query.orWhere('post.released_at = :date AND post.id < :id', {
            date: post.released_at,
            id: post.id,
          });
        }

        const posts = await query.getMany();
        return posts;
      } catch (err) {
        throw Error(err);
      }
    },
    topFivePost: async (parent: any, { offset = 0, limit = 5 }) => {
      const rows = (await getManager().query(
        `
        select posts.id, posts.title, SUM(score) as score  from post_scores
        inner join posts on post_scores.post_id = posts.id
        group by posts.id
        order by score desc, posts.id desc
        offset $1
        limit $2
      `,
        [offset, limit],
      )) as { id: string; score: number }[];

      const ids = rows.map(row => row.id);

      const posts = await getRepository(Post).findByIds(ids);

      if (rows == []) {
        return rows;
      } else {
        const Postrows = (await getManager().query(
          `
          select * from posts
          offset $1
          limit $2
        `,
          [offset, limit],
        )) as { id: string }[];

        const getPost = getRepository(Post);

        const Posts = await getPost.find({
          order: {
            created_at: 'DESC',
          },
        });

        return Posts;
      }
    },
    searchPosts: async (_: any, { cursor, searchInput, offset, username }: any) => {
      try {
        const formattedQuery = searchInput.trim();

        const query = await getManager()
          .createQueryBuilder(Post, 'post')

          .orderBy('post.released_at', 'DESC')
          .addOrderBy('post.id', 'DESC')
          .leftJoinAndSelect('post.user', 'user')
          .where('to_tsvector(post.title) @@ to_tsquery(:searchInput)', {
            searchInput: `${formattedQuery}:*`,
          });

        const posts = await query.getMany();
        return posts;
      } catch (err) {
        throw Error(err);
      }
    },
  },
  Mutation: {
    createPost: async (_, args, { req, res }) => {
      const getPost = getRepository(Post);
      const postTags = getRepository(PostsTags);

      if (!res.locals.user_id) {
        throw new AuthenticationError('plz login');
      }

      const { tags, title, body, thumbnail } = args as PostArgs;

      const post = new Post();

      if (checkEmpty(title!)) {
        throw new ApolloError('Title is empty');
      }

      post.user_id = res.locals.user_id;
      post.title = title;
      post.body = body;
      post.thumbnail = thumbnail;

      await getPost.save(post);

      if (tags) {
        const postTag = new PostsTags();
        const tagsData = await findTag(tags);

        if (tagsData) {
          postTag.post_id = post.id;
          postTag.name = tagsData;

          await postTags.save(postTag);
        }
      }

      return post;
    },

    uploadImage: async (_, args) => {
      const fileStr = args.body;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: 'woong',
        width: 720,
        height: 487,
        crop: 'scale',
      });
      return uploadResponse;
    },

    editPost: async (_, args, { req, res }) => {
      if (!res.locals.user_id) {
        throw new AuthenticationError('plz login');
      }

      const { post_id, title, body, thumbnail } = args as PostEditArgs;

      const getPost = getRepository(Post);
      const post = await getPost.findOne({
        where: {
          id: post_id,
        },
      });

      if (!post) {
        throw new ApolloError('Post not found');
      }

      if (post.user_id !== res.locals.user_id) {
        throw new ApolloError('this is not yours');
      }

      post.title = title;
      post.body = body;
      post.thumbnail = thumbnail;
      Object.assign(post, args);

      await getPost.save(post);

      return post;
    },
    removePost: async (_, args, { req, res }) => {
      if (!res.locals.user_id) {
        throw new AuthenticationError('plz login');
      }
      const getPost = getRepository(Post);

      const post = await getPost.findOne({
        where: {
          id: args.post_id,
        },
      });

      if (!post) {
        throw new ApolloError('Post not found');
      }

      if (post.user_id !== res.locals.user_id) {
        throw new ApolloError('This is not your post');
      }

      await getPost.remove(post);

      return true;
    },

    likePost: async (_, args, { req, res }) => {
      if (!res.locals.user_id) {
        throw new AuthenticationError('plz login');
      }

      const getPost = getRepository(Post);
      const getLikePost = getRepository(PostLike);
      const getPostScore = getRepository(PostScore);

      const post = await getPost.findOne({
        where: {
          id: args.id,
        },
      });

      if (!post) {
        throw new ApolloError('Post not found');
      }

      const alreadyLiked = await getLikePost.findOne({
        where: {
          post_id: args.id,
          user_id: res.locals.user_id,
        },
      });

      if (alreadyLiked) {
        throw new ApolloError('you already liked post');
      }

      const postLike = new PostLike();
      postLike.post_id = args.id;
      postLike.user_id = res.locals.user_id;

      try {
        await getLikePost.save(postLike);
      } catch (e) {
        return post;
      }

      const count = await getLikePost.count({
        where: {
          post_id: args.id,
        },
      });

      post.likes = count;

      await getPost.save(post);

      const score = new PostScore();
      score.type = 'LIKE';
      score.post_id = args.id;
      score.score = 5;
      score.user_id = res.locals.user_id;
      await getPostScore.save(score);

      return post;
    },

    unLikePost: async (_, args, { req, res }) => {
      if (!res.locals.user_id) {
        throw new AuthenticationError('plz login');
      }

      const getPost = getRepository(Post);
      const getLikePost = getRepository(PostLike);
      const getPostScore = getRepository(PostScore);

      const post = await getPost.findOne({
        where: {
          id: args.id,
        },
      });

      if (!post) {
        throw new ApolloError('Post not found');
      }

      const postLike = await getLikePost.findOne({
        where: {
          post_id: args.id,
          user_id: res.locals.user_id,
        },
      });

      if (!postLike) {
        return post;
      }

      await getLikePost.remove(postLike);

      const count = await getLikePost.count({
        where: {
          post_id: args.id,
        },
      });

      post.likes = count;

      await getPost.save(post);
      await getPostScore
        .createQueryBuilder()
        .delete()
        .where('post_id = :postId', { postId: args.id })
        .andWhere('user_id = :userId', { userId: res.locals.user_id })
        .andWhere("type = 'LIKE'")
        .execute();

      return post;
    },
    postView: async (_, args, { req }) => {
      const postRead = getRepository(PostReadLog);

      const ipHash = hash(req.ip);

      const viewed = await postRead
        .createQueryBuilder('post_read')
        .where('ip = :ip', { ipHash })
        .andWhere('post_id = :postId', { postId: args.id })
        .andWhere("created_at > (NOW() - INTERVAL '24 HOURS')")
        .getOne();
      if (viewed) return false;
      const postReads = new PostReadLog();
      postReads.post_id = args.id;
      postReads.user_id = req.user_Id;
      postReads.ip = ipHash;
      await postRead.save(postReads);

      const getPost = getRepository(Post);
      await getPost
        .createQueryBuilder()
        .update()
        .set({
          views: () => 'views + 1',
        })
        .where('id = :id', { id: args.id })
        .execute();

      const post = await getPost.findOne(args.id);
      if (!post) return false;

      const postScoreRepo = getRepository(PostScore);

      const score = new PostScore();
      score.post_id = args.id;
      score.type = 'READ';
      score.score = 0.25;
      await postScoreRepo.save(score);

      return true;
    },
  },
};

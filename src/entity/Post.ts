import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import User from './User';
import Comments from './Comment';
import PostsTags from './PostsTags';

@Entity('posts', {
  synchronize: true,
})
export default class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column('text')
  body!: string;

  @Column({ nullable: true, type: 'varchar' })
  thumbnail!: string | null;

  @ManyToOne(type => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('uuid')
  user_id!: string;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0, nullable: true })
  views!: number;

  @Index()
  @Column({ length: 700, nullable: true })
  url!: string;

  @Column({ length: 255, nullable: true })
  endCursor!: string;

  @Column({ default: false })
  hasMore!: boolean;

  @Index()
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
    nullable: false,
  })
  released_at!: Date;

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(type => Comments, comment => comment.post, { cascade: true })
  comments!: Comments[];

  @OneToMany(type => PostsTags, tag => tag.post, { cascade: true })
  tags!: PostsTags[];
}

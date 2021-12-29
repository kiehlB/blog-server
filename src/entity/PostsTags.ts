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
  getRepository,
  getManager,
} from 'typeorm';
import Post from './Post';
import Tag from './Tag';

@Entity('posts_tags', {
  synchronize: true,
})
export default class PostsTags {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 255 })
  name!: string;

  @Index()
  @Column('uuid')
  post_id!: string;

  @Index()
  @Column('uuid')
  tag_id!: string;

  @ManyToOne(type => Post, { cascade: true })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(type => Tag, { cascade: true, eager: true })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag;

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;
}

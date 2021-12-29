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
} from 'typeorm';
import Following from './Following';
import Post from './Post';
import User from './User';

@Entity('followers', {
  synchronize: true,
})
export default class Followers {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(type => User, { cascade: true, eager: true })
  @JoinColumn()
  user!: User;
}

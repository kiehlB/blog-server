import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('social_user', {
  synchronize: true,
})
export default class SocialUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ unique: true })
  githubId: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}

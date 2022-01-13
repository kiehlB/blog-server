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
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  social_id!: string;

  @Column({ length: 255 })
  access_token!: string;

  @Column({ length: 255 })
  provider!: string;

  @Index()
  @Column({ unique: true, nullable: true })
  githubId: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToOne(type => User, { cascade: true })
  @JoinColumn({ name: ' user_id' })
  user!: User;

  @Column('uuid')
  user_id!: string;
}

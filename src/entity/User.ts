import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import UserProfile from './UserProfile';

@Entity('users', {
  synchronize: true,
})
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ unique: true, length: 20 })
  username!: string;

  @Column('text')
  password!: string;

  @Index()
  @Column({ unique: true, length: 20, nullable: true })
  email!: string | null;

  @Column({ default: false })
  email_verified!: boolean;

  @Column('int', { default: 0 })
  tokenVersion!: number;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToOne(type => UserProfile, profile => profile.user)
  profile!: UserProfile;
}

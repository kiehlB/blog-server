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

@Entity('user_profiles', {
  synchronize: true,
})
export default class UserProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  bio!: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('uuid')
  user_id!: string;
}

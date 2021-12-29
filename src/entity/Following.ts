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
import User from './User';

@Entity('following', {
  synchronize: true,
})
export default class Following {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @ManyToOne(type => User, { cascade: true, eager: true })
  user!: User;
}

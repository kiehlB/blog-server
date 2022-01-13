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
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('uuid')
  following_id!: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @ManyToOne(type => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(type => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'following_id' })
  following!: User;
}

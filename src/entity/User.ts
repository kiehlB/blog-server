import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  OneToOne,
  getRepository,
} from 'typeorm';
import { generateToken } from '../lib/token';
import AuthToken from './AuthToken';
import UserProfile from './UserProfile';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ unique: true, length: 20 })
  username!: string;

  @Column('text')
  password!: string;

  @Index()
  @Column({ unique: true, length: 20 })
  email!: string | null;

  @Column({ default: false })
  email_verified!: boolean;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToOne(
    type => UserProfile,
    profile => profile.user,
  )
  profile!: UserProfile;

  async generateUserToken() {
    const authToken = new AuthToken();
    authToken.user_id = this.id;
    await getRepository(AuthToken).save(authToken);

    const refreshToken = await generateToken(
      {
        user_id: this.id,
        token_id: authToken.id,
      },
      {
        subject: 'refresh_token',
        expiresIn: '30d',
      },
    );

    const accessToken = await generateToken(
      {
        user_id: this.id,
      },
      {
        subject: 'access_token',
        expiresIn: '1h',
      },
    );

    return {
      refreshToken,
      accessToken,
    };
  }
  async refreshUserToken(
    tokenId: string,
    refreshTokenExp: number,
    originalRefreshToken: string,
  ) {
    const now = new Date().getTime();
    const diff = refreshTokenExp * 1000 - now;
    let refreshToken = originalRefreshToken;

    if (diff < 1000 * 60 * 60 * 24 * 15) {
      refreshToken = await generateToken(
        {
          user_id: this.id,
          token_id: tokenId,
        },
        {
          subject: 'refresh_token',
          expiresIn: '30d',
        },
      );
    }
    const accessToken = await generateToken(
      {
        user_id: this.id,
      },
      {
        subject: 'access_token',
        expiresIn: '1h',
      },
    );

    return { refreshToken, accessToken };
  }
}

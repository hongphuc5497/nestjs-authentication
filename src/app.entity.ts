import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  authConfirmToken: string;

  @Column({ default: false, nullable: true })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

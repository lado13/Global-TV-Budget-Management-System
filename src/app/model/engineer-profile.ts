/** Matches EngineerProfileDto from Global.Budget.Ge API. */
export interface EngineerProfile {
  id: number;
  engineerId: number;
  imageUrl?: string;
  phone?: string;
  email?: string;
  position?: string;
  description?: string;
  createAt?: string;
  updateAt?: string;
  engineerName?: string;
}

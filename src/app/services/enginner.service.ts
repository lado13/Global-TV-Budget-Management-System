import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap, catchError, map } from 'rxjs';
import { environment } from '../../environment/environment';
import { Enginner } from '../model/enginner';
import { EngineerProfile } from '../model/engineer-profile';
import { NamedEntityService } from '../shared/services/named-entity.service';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class EnginnerService extends NamedEntityService<Enginner> {
  protected readonly apiUrl = environment.EnginnerApi;
  private readonly profileApiUrl = environment.EnginerProfileApi;

  readonly engineers$ = this.data$;

  private readonly _profileData$ = new BehaviorSubject<EngineerProfile[]>([]);
  readonly engineerProfiles$ = this._profileData$.asObservable();

  constructor(private readonly fileService: FileService) {
    super();
    this.load();
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.http.get<EngineerProfile[]>(`${this.profileApiUrl}?t=${Date.now()}`).subscribe({
      next: (data) => this._profileData$.next(data ?? []),
      error: (err) => console.error('Failed to load engineer profiles', err)
    });
  }

  loadProfilesIfEmpty(): void {
    if (this._profileData$.value.length > 0) return;
    this.loadProfiles();
  }

  getProfileByEngineerId(engineerId: number): EngineerProfile | undefined {
    return this._profileData$.value.find((p) => p.engineerId === engineerId);
  }

  private buildProfileBody(profile: Partial<EngineerProfile>): Record<string, unknown> {
    const body: Record<string, unknown> = {
      id: profile.id ?? 0,
      engineerId: profile.engineerId
    };

    for (const key of [
      'imageUrl',
      'phone',
      'email',
      'position',
      'description',
      'engineerName'
    ] as const) {
      const value = profile[key];
      if (typeof value === 'string' && value.trim()) {
        body[key] = value.trim();
      }
    }

    return body;
  }

  createProfile(profile: Partial<EngineerProfile>): Observable<EngineerProfile> {
    return this.http
      .post<EngineerProfile>(this.profileApiUrl, this.buildProfileBody({ ...profile, id: 0 }))
      .pipe(tap(() => this.loadProfiles()));
  }

  updateProfile(profile: EngineerProfile): Observable<unknown> {
    return this.http
      .put(this.profileApiUrl, this.buildProfileBody(profile))
      .pipe(tap(() => this.loadProfiles()));
  }

  deleteProfile(profile: EngineerProfile): Observable<unknown> {
    return this.http
      .delete(this.profileApiUrl, { body: profile })
      .pipe(tap(() => this.loadProfiles()));
  }

  createWithProfile(
    name: string,
    profile?: Partial<Omit<EngineerProfile, 'id' | 'engineerId' | 'engineerName'>>,
    imageFile?: File | null
  ): Observable<unknown> {
    return this.http.post<Enginner | number>(this.apiUrl, { id: 0, name }).pipe(
      switchMap(() =>
        // Always re-fetch to get the new engineer id reliably
        this.http.get<Enginner[]>(`${this.apiUrl}?t=${Date.now()}`).pipe(
          tap((list) => this.setData(list ?? [])),
          map((list) => {
            const id = [...(list ?? [])]
              .reverse()
              .find((e) => e.name === name)?.id;
            if (!id) {
              throw new Error('Engineer created but id not found');
            }
            return id;
          })
        )
      ),
      switchMap((engineerId) => {
        const imageUrl$ = imageFile
          ? this.fileService.uploadAndGetUrl(imageFile)
          : of('');

        return imageUrl$.pipe(
          switchMap((imageUrl) => {
            const payload: Partial<EngineerProfile> = {
              engineerId,
              engineerName: name
            };

            if (imageUrl) payload.imageUrl = imageUrl;
            if (profile?.phone?.trim()) payload.phone = profile.phone.trim();
            if (profile?.email?.trim()) payload.email = profile.email.trim();
            if (profile?.position?.trim()) payload.position = profile.position.trim();
            if (profile?.description?.trim()) payload.description = profile.description.trim();

            const hasProfile =
              !!payload.imageUrl ||
              !!payload.phone ||
              !!payload.email ||
              !!payload.position ||
              !!payload.description;

            if (!hasProfile) {
              return of(null);
            }

            return this.createProfile(payload);
          }),
          catchError((err) => {
            console.error('Profile/image save failed', err);
            const detail =
              err?.error?.message ||
              err?.error?.title ||
              (err?.error?.errors
                ? Object.values(err.error.errors).flat().join(' ')
                : null) ||
              err?.message ||
              'unknown';
            throw new Error(`PROFILE_SAVE_FAILED:${detail}`);
          })
        );
      }),
      tap(() => {
        this.load();
        this.loadProfiles();
      })
    );
  }

  uploadProfileImage(file: File): Observable<string> {
    return this.fileService.uploadAndGetUrl(file);
  }
}

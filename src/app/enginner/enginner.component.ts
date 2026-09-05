import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnginnerService } from '../services/enginner.service';
import { Enginner } from '../model/enginner';
import { EngineerProfile } from '../model/engineer-profile';
import { NamedEntityListBase } from '../shared/base/named-entity-list.base';
import { DEFAULT_AVATAR } from '../shared/constants/app.constants';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { LanguageService } from '../shared/i18n/language.service';

@Component({
  selector: 'app-enginner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './enginner.component.html',
  styleUrl: './enginner.component.scss'
})
export class EnginnerComponent extends NamedEntityListBase<Enginner> {
  protected readonly entityService = inject(EnginnerService);
  private readonly lang = inject(LanguageService);

  get engineers$() {
    return this.items$;
  }

  get selectedEngineer() {
    return this.selectedItem;
  }

  profiles: EngineerProfile[] = [];

  newEngineer = {
    name: '',
    imageUrl: '',
    phone: '',
    email: '',
    position: '',
    description: ''
  };

  /** Actual file to upload — API needs a short URL, not a data-URL. */
  private newImageFile: File | null = null;
  private editImageFile: File | null = null;
  private newPreviewObjectUrl: string | null = null;
  private editPreviewObjectUrl: string | null = null;

  editProfile: Partial<EngineerProfile> = {
    imageUrl: '',
    phone: '',
    email: '',
    position: '',
    description: ''
  };

  selectedProfile: EngineerProfile | null = null;
  isUploadingImage = false;

  protected override onInitExtra(): void {
    this.entityService.loadProfilesIfEmpty();
    this.entityService.engineerProfiles$.subscribe((data) => {
      this.profiles = data ?? [];
    });
  }

  protected getDeleteConfirmMessage(eng: Enginner): string {
    return this.lang.t('engineer.confirmDelete', { name: eng.name });
  }

  protected override resetCreateForm(): void {
    this.clearNewImage();
    this.newEngineer = {
      name: '',
      imageUrl: '',
      phone: '',
      email: '',
      position: '',
      description: ''
    };
    this.isUploadingImage = false;
  }

  onNewImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(this.lang.t('common.pickImageFile'));
      input.value = '';
      return;
    }

    this.revokePreview(this.newPreviewObjectUrl);
    this.newImageFile = file;
    this.newPreviewObjectUrl = URL.createObjectURL(file);
    this.newEngineer.imageUrl = this.newPreviewObjectUrl;
    input.value = '';
  }

  onEditImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(this.lang.t('common.pickImageFile'));
      input.value = '';
      return;
    }

    this.revokePreview(this.editPreviewObjectUrl);
    this.editImageFile = file;
    this.editPreviewObjectUrl = URL.createObjectURL(file);
    this.editProfile.imageUrl = this.editPreviewObjectUrl;
    input.value = '';
  }

  clearNewImage(): void {
    this.revokePreview(this.newPreviewObjectUrl);
    this.newPreviewObjectUrl = null;
    this.newImageFile = null;
    this.newEngineer.imageUrl = '';
  }

  clearEditImage(): void {
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editImageFile = null;
    this.editProfile.imageUrl = this.selectedProfile?.imageUrl ?? '';
  }

  addNew(): void {
    const name = this.newEngineer.name.trim();
    if (!name) return;

    const profile: Partial<Omit<EngineerProfile, 'id' | 'engineerId' | 'engineerName'>> = {};
    if (this.newEngineer.phone.trim()) profile.phone = this.newEngineer.phone.trim();
    if (this.newEngineer.email.trim()) profile.email = this.newEngineer.email.trim();
    if (this.newEngineer.position.trim()) profile.position = this.newEngineer.position.trim();
    if (this.newEngineer.description.trim()) profile.description = this.newEngineer.description.trim();

    this.isUploadingImage = !!this.newImageFile;

    this.entityService.createWithProfile(name, profile, this.newImageFile).subscribe({
      next: () => {
        this.clearNewImage();
        this.newEngineer = {
          name: '',
          imageUrl: '',
          phone: '',
          email: '',
          position: '',
          description: ''
        };
        this.isUploadingImage = false;
        this.closeCreateModal();
      },
      error: (err) => {
        this.isUploadingImage = false;
        console.error('Error creating engineer:', err);
        const msg = String(err?.message ?? err ?? '');
        if (msg.startsWith('PROFILE_SAVE_FAILED:')) {
          this.clearNewImage();
          this.newEngineer = {
            name: '',
            imageUrl: '',
            phone: '',
            email: '',
            position: '',
            description: ''
          };
          this.closeCreateModal();
          alert(
            this.lang.t('engineer.profileSavePartial', {
              detail: msg.replace('PROFILE_SAVE_FAILED:', '')
            })
          );
          return;
        }
        alert(this.lang.t('engineer.addFailed'));
      }
    });
  }

  edit(eng: Enginner): void {
    this.onEdit(eng);
    this.selectedProfile = this.entityService.getProfileByEngineerId(eng.id) ?? null;
    this.editImageFile = null;
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editProfile = {
      imageUrl: this.selectedProfile?.imageUrl ?? '',
      phone: this.selectedProfile?.phone ?? '',
      email: this.selectedProfile?.email ?? '',
      position: this.selectedProfile?.position ?? '',
      description: this.selectedProfile?.description ?? ''
    };
  }

  override closeModal(): void {
    super.closeModal();
    this.selectedProfile = null;
    this.editImageFile = null;
    this.revokePreview(this.editPreviewObjectUrl);
    this.editPreviewObjectUrl = null;
    this.editProfile = {
      imageUrl: '',
      phone: '',
      email: '',
      position: '',
      description: ''
    };
  }

  override saveEdit(newName: string): void {
    const trimmedName = newName.trim();
    if (!this.selectedItem) {
      this.closeModal();
      return;
    }

    const nameChanged = !!trimmedName && trimmedName !== this.selectedItem.name;
    const engineerId = this.selectedItem.id;
    const finalName = trimmedName || this.selectedItem.name;
    const imageFile = this.editImageFile;

    const afterNameSaved = () => {
      const finishProfile = (imageUrl?: string) => {
        const profileFields: Partial<EngineerProfile> = {
          id: this.selectedProfile?.id ?? 0,
          engineerId,
          engineerName: finalName
        };

        const resolvedImage =
          imageUrl ||
          (this.editProfile.imageUrl?.startsWith('blob:')
            ? ''
            : (this.editProfile.imageUrl ?? '').trim());

        if (resolvedImage) profileFields.imageUrl = resolvedImage;
        if ((this.editProfile.phone ?? '').trim()) {
          profileFields.phone = (this.editProfile.phone ?? '').trim();
        }
        if ((this.editProfile.email ?? '').trim()) {
          profileFields.email = (this.editProfile.email ?? '').trim();
        }
        if ((this.editProfile.position ?? '').trim()) {
          profileFields.position = (this.editProfile.position ?? '').trim();
        }
        if ((this.editProfile.description ?? '').trim()) {
          profileFields.description = (this.editProfile.description ?? '').trim();
        }

        const hasOptionalProfileData = !!(
          profileFields.imageUrl ||
          profileFields.phone ||
          profileFields.email ||
          profileFields.position ||
          profileFields.description
        );

        if (!this.selectedProfile && !hasOptionalProfileData) {
          this.closeModal();
          return;
        }

        const request$ = this.selectedProfile
          ? this.entityService.updateProfile(profileFields as EngineerProfile)
          : this.entityService.createProfile(profileFields);

        request$.subscribe({
          next: () => this.closeModal(),
          error: (err) => {
            console.error('Error saving profile:', err);
            alert(this.lang.t('engineer.savedProfileFailed'));
            this.closeModal();
          }
        });
      };

      if (imageFile) {
        this.isUploadingImage = true;
        this.entityService.uploadProfileImage(imageFile).subscribe({
          next: (url) => {
            this.isUploadingImage = false;
            finishProfile(url);
          },
          error: (err) => {
            this.isUploadingImage = false;
            console.error(err);
            alert(this.lang.t('common.imageUploadFailed'));
          }
        });
      } else {
        finishProfile();
      }
    };

    if (nameChanged) {
      this.entityService.update(engineerId, finalName).subscribe({
        next: () => afterNameSaved(),
        error: (err) => console.error('Error updating engineer:', err)
      });
    } else {
      afterNameSaved();
    }
  }

  remove(eng: Enginner): void {
    if (!confirm(this.getDeleteConfirmMessage(eng))) return;

    const profile = this.entityService.getProfileByEngineerId(eng.id);
    const deleteEngineer = () =>
      this.entityService.delete(eng.id, eng.name).subscribe({
        error: (err) => console.error('Error deleting engineer:', err)
      });

    if (profile) {
      this.entityService.deleteProfile(profile).subscribe({
        next: () => deleteEngineer(),
        error: () => deleteEngineer()
      });
    } else {
      deleteEngineer();
    }
  }

  getProfileImage(engineerId: number): string {
    const profile = this.profiles.find((p) => p.engineerId === engineerId);
    return profile?.imageUrl || DEFAULT_AVATAR;
  }

  private revokePreview(url: string | null): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}

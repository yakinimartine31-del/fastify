import * as albumsRepository from './repository.js'

export async function addPhoto(mysql, userId: number, photoUrl: string, caption: string, isPrimary: boolean = false) {
  const photoId = await albumsRepository.addPhoto(mysql, userId, photoUrl, caption, isPrimary)
  return { photoId }
}

export async function getMyPhotos(mysql, userId: number) {
  return albumsRepository.getUserPhotos(mysql, userId)
}

export async function getUserPhotos(mysql, userId: number) {
  return albumsRepository.getUserPhotos(mysql, userId)
}

export async function updatePhoto(mysql, photoId: number, userId: number, caption: string, isPrimary: boolean) {
  await albumsRepository.updatePhoto(mysql, photoId, userId, caption, isPrimary)
  return { message: 'Photo updated' }
}

export async function deletePhoto(mysql, photoId: number, userId: number) {
  await albumsRepository.deletePhoto(mysql, photoId, userId)
  return { message: 'Photo deleted' }
}

export async function setPrimary(mysql, photoId: number, userId: number) {
  await albumsRepository.setPrimaryPhoto(mysql, photoId, userId)
  return { message: 'Primary photo updated' }
}

import api from './apiService'

export default class snapshotService {
  static createSnapshot (snapshot, projectKey) {
    const scene = JSON.stringify(snapshot.scene.toJSON())
    const options = {
      data: {
        title: snapshot.title,
        scene
      }
    }
    return api.post(`/add-snapshot/${projectKey}`, options)
      .then(res => {
        return res
      })
  }

  static getSnapshots (projectKey) {
    return api.get(`/get-snapshots/${projectKey}`)
      .then(res => {
        console.log(res)
        return res
      })
  }

  static getSnapshotScene (snapshotKey) {
    return api.get(`/snapshot/${snapshotKey}`)
      .then(res => {
        console.log(res)
        return res.scene
      })
  }

  static delSnapshot (snapshotKey) {
    return api.get(`/del-snapshot/${snapshotKey}`)
      .then(res => {
        return res
      })
  }
}
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        communities: resolve(__dirname, 'communities.html'),
        about: resolve(__dirname, 'about.html'),
        designCenter: resolve(__dirname, 'design-center.html'),
        virtualTours: resolve(__dirname, 'virtual-tours.html'),
        energyEfficiency: resolve(__dirname, 'energy-efficiency.html'),
        contact: resolve(__dirname, 'contact.html'),
        inventoryHomes: resolve(__dirname, 'inventory-homes.html'),
        homeDetails: resolve(__dirname, 'home-details.html'),
        glacierPointe: resolve(__dirname, 'glacier-pointe.html'),
        hickoryCreek: resolve(__dirname, 'hickory-creek.html'),
        holtonRun: resolve(__dirname, 'holton-run.html'),
        jeromeVillageAster: resolve(__dirname, 'jerome-village-aster.html'),
        rennerPark: resolve(__dirname, 'renner-park.html'),
        cottagesAtVerbena: resolve(__dirname, 'cottages-at-verbena.html'),
        reserveAtNewCalifornia: resolve(__dirname, 'reserve-at-new-california.html'),
        retreatAtHickoryLakes: resolve(__dirname, 'retreat-at-hickory-lakes.html')
      }
    }
  }
})

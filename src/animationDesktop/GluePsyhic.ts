import { clamp } from './utils/clamp';

const CANVAS_PADDING = 200;
const groupSize = 100;
const randomPos = () => Math.random() * groupSize - groupSize / 2;

const PARTICLES_IN_GROUP = 15
const GROUPS = 3
const FRAMES = 100
const SPEED = 1
const MAX_TIME = FRAMES * Math.PI

interface IParticle extends Point {
  lifeTime: number
  scale: number
  alpha: number
}

export interface IGlueGroup {
  center: Point
  angle: number
  modAngle: number
  particles: IParticle[];
}

export default class GluePsyhic {
  public glueGroups: IGlueGroup[] = []
  private width: number
  private height: number

  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    const maxX = this.width - 2 * CANVAS_PADDING
    const maxY = this.height - 2 * CANVAS_PADDING
    const startPositions = [
      {
        x: CANVAS_PADDING + maxX * 0.1,
        y: CANVAS_PADDING + maxY * Math.random(),
      },
      {
        x: CANVAS_PADDING + maxX * 0.9,
        y: CANVAS_PADDING + maxY * Math.random(),
      },
      {
        x: CANVAS_PADDING + maxX * (Math.random() > 0.5 ? 0.3 : 0.7),
        y: CANVAS_PADDING + maxY * 0.75,
      },
    ]
    console.log(startPositions)
    this.glueGroups = Array.from(
      { length: GROUPS },
      (_, index) => {
      const center = startPositions[index]
      const particles = Array.from(
        { length: PARTICLES_IN_GROUP },
        (_, index) => {
          const progress = index / (PARTICLES_IN_GROUP - 1)
          return {
            x: center.x + randomPos(),
            y: center.y + randomPos(),
            scale: 0,
            lifeTime: Math.round(-MAX_TIME * progress),
            alpha: 1,
          }
        })

      return {
        center,
        angle: Math.random() * Math.PI * 2,
        modAngle: Math.random() > 0.5 ? -0.0025 : 0.0025,
        particles,
      }
    })

    window.addEventListener('resize', this.handleResize.bind(this))

    console.log(this.glueGroups)
  }

  private handleResize() {
    const newWidth = window.innerWidth
    const newHeight = window.innerHeight
    this.glueGroups.forEach(glueGroup => {
      const newX = glueGroup.center.x * newWidth / this.width
      const newY = glueGroup.center.y * newHeight / this.height
      glueGroup.center = {
        x: clamp(CANVAS_PADDING + SPEED, newX, newWidth - CANVAS_PADDING - SPEED),
        y: clamp(CANVAS_PADDING + SPEED, newY, newHeight - CANVAS_PADDING - SPEED),
      }
    })

    this.width = newWidth
    this.height = newHeight
  }

  private updateGroupCenter = (glueGroup: IGlueGroup) => {
    const { center, modAngle } = glueGroup

    if(center.x < CANVAS_PADDING) {
      center.x -= Math.sin(glueGroup.angle) * SPEED
      glueGroup.angle += Math.abs(modAngle) / modAngle * Math.PI / 3
    } else if(center.x > this.width - CANVAS_PADDING) {
      center.x -= Math.sin(glueGroup.angle) * SPEED
      glueGroup.angle += Math.abs(modAngle) / modAngle * Math.PI / 3
    } else if(center.y < CANVAS_PADDING) {
      center.y += Math.cos(glueGroup.angle) * SPEED
      glueGroup.angle += Math.abs(modAngle) / modAngle * Math.PI / 3
    } else if(center.y > this.height - CANVAS_PADDING) {
      center.y += Math.cos(glueGroup.angle) * SPEED
      glueGroup.angle += Math.abs(modAngle) / modAngle * Math.PI / 3        
    }

    glueGroup.angle += modAngle
    center.x += Math.sin(glueGroup.angle) * SPEED
    center.y -= Math.cos(glueGroup.angle) * SPEED
  }

  private updateGroupParticles({ particles, center }: IGlueGroup) {
    particles.forEach(particle => {

      if (particle.lifeTime >= -1 && particle.lifeTime < 0) {
        particle.x = center.x + randomPos()
        particle.y = center.y + randomPos()
      }

      particle.lifeTime++
      if (particle.lifeTime < 0) return

      particle.scale = Math.sin(particle.lifeTime / FRAMES)
      if(particle.lifeTime >= MAX_TIME) {
        particle.x = center.x + randomPos()
        particle.y = center.y + randomPos()
        particle.lifeTime = 0
        particle.alpha = 1
      } else if(particle.lifeTime >= MAX_TIME * 0.8) {
        particle.alpha = (MAX_TIME - particle.lifeTime) / (MAX_TIME * 0.2)
      }
    })
  }

  public update() {
    this.glueGroups.forEach(this.updateGroupCenter)
    this.glueGroups.forEach(this.updateGroupParticles)
  }
}
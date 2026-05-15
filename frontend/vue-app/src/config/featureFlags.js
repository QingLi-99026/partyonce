export const featureFlags = {
  aiExperienceEnabled: false,
  threeDExperienceEnabled: false,
  venueFilterEnabled: true,
  showSocialLinks: true
}

export const isFeatureEnabled = (flagName) => Boolean(featureFlags[flagName])

export const socialLinks = [
  {
    name: 'TikTok',
    iconPath: '/party-assets/social/tiktok.svg',
    url: 'https://www.tiktok.com/@partyevent'
  },
  {
    name: 'YouTube',
    iconPath: '/party-assets/social/youtube.svg',
    url: 'https://www.youtube.com/@partyevent'
  },
  {
    name: 'Instagram',
    iconPath: '/party-assets/social/instagram.svg',
    url: 'https://www.instagram.com/partyevent'
  }
]

export const socialVideoLink = {
  label: '观看精彩视频',
  url: 'https://www.youtube.com/@partyevent'
}

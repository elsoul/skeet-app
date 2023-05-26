import tw from '@/lib/tailwind'
import SkeetLogoHorizontal from '@assets/logo/SkeetLogoHorizontal.svg'
import SkeetLogoHorizontalInvert from '@assets/logo/SkeetLogoHorizontalInvert.svg'

export default function LogoHorizontal() {
  return (
    <>
      <SkeetLogoHorizontal style={tw`h-10 mx-auto w-28 dark:hidden`} />
      <SkeetLogoHorizontalInvert
        style={tw`hidden h-10 mx-auto w-28 dark:flex`}
      />
    </>
  )
}

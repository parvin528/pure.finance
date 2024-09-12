import { inter } from '../../fonts'
import Navbar from '../Navbar'

import Footer from './Footer'
import Head from './Head'
import HelperBox from './HelperBox'

const ToolsLayout = ({
  children,
  title,
  helperText,
  walletConnection,
  breadcrumb
}) => (
  <>
    <Head title={title} />
    <div className={`w-full h-full ${inter.className} flex`}>
      <div className="flex flex-col justify-between lg:w-8/12 xl:w-7/12">
        <div>
          <Navbar
            breadcrumb={breadcrumb}
            title={title}
            walletConnection={walletConnection}
          />
          <div className="container flex justify-center py-8">{children}</div>
          <HelperBox className="lg:hidden" helperText={helperText} />
        </div>
        <Footer />
      </div>
      <HelperBox
        className="hidden lg:block lg:w-4/12 xl:w-5/12"
        helperText={helperText}
      />
    </div>
  </>
)

export default ToolsLayout

import { observer } from 'mobx-react-lite'

import { WebApplication } from '@/Application/WebApplication'
import Authentication from './Authentication'
import Credentials from './Credentials'
import Sync from './Sync'
import SignOutWrapper from './SignOutView'
import FilesSection from './Files'
import PreferencesPane from '../../PreferencesComponents/PreferencesPane'
import DeleteAccount from '@/Components/Preferences/Panes/Account/DeleteAccount'

type Props = {
  application: WebApplication
}

const AccountPreferences = ({ application }: Props) => {
  return (
    <PreferencesPane>
      {!application.hasAccount() ? (
        <Authentication application={application} />
      ) : (
        <>
          <Credentials application={application} />
          <Sync application={application} />
        </>
      )}
      {application.hasAccount() && application.featuresController.entitledToFiles && (
        <FilesSection application={application} />
      )}
      <SignOutWrapper application={application} />
      <DeleteAccount application={application} />
    </PreferencesPane>
  )
}

export default observer(AccountPreferences)

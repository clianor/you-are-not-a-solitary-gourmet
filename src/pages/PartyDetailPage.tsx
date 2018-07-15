import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { RouteComponentProps } from 'react-router-dom'

import { Overlay, CenterText } from '../CommonStyledComponents'
import PartyDetail from '../PartyDetail'

import { ESC } from '../utils/keycodes'

import { joinParty, leaveParty } from '../utils/party'

type Props = RouteComponentProps<any> & {
  userStore: IUserStore,
  partyStore: IPartyStore,
}

@inject((allStores: IAllStore) => ({
  userStore: allStores.userStore as IUserStore,
  partyStore: allStores.partyStore as IPartyStore,
}))
@observer
class PartyDetailPage extends React.Component<Props> {
  componentDidMount() {
    document.body.classList.add('modal-open')
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.body.classList.remove('modal-open')
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  renderMemberLimit(party: Party) {
    const { maxPartyMember, fetchedJoinners } = party

    if (!fetchedJoinners) {
      return false
    }

    if (maxPartyMember === 0) {
      return <span>무제한 멤버</span>
    }

    const joinnedMemberCount = fetchedJoinners.length

    if (maxPartyMember > joinnedMemberCount) {
      return (
        <span>총 {party.maxPartyMember}명</span>
      )
    }

    return <span>인원마감</span>
  }

  close() {
    this.props.history.push('/')
  }

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.keyCode !== ESC) return
    this.close()
  }

  render() {
    const { partyStore, userStore, match } = this.props
    const { user } = userStore
    const { initializedParty } = partyStore

    if (!initializedParty) {
      return (
        <Overlay onClick={() => this.close()}>
          <CenterText>
            <h1>Loading..</h1>
          </CenterText>
        </Overlay>
      )
    }

    const { parties } = partyStore
    const { partyId } = match.params

    if (parties && parties.length > 0) {
      const party = parties.find((party: Party) => party.id === partyId)

      if (party) {
        return (
          <Overlay onClick={() => this.close()}>
            <PartyDetail
              party={party}
              user={user}
              renderMemberLimit={this.renderMemberLimit}
              onJoinParty={(partyId: string, email: string) => joinParty(partyId, email)}
              onLeaveParty={(partyId: string, email: string) => leaveParty(partyId, email)}
            />
          </Overlay>
        )
      }
    }

    return (
      <Overlay onClick={() => this.close()}>
        <CenterText>
          <h1>파티가 존재하지 않거나 이미 끝난 파티입니다.</h1>
        </CenterText>
      </Overlay>
    )
  }
}

export default PartyDetailPage

import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'

import Categories from '../Categories'
import PartyList from '../PartyList'

import { unsubscribeTodayParties } from '../utils/party'

interface Props {
  partyStore?: IPartyStore
  userStore?: IUserStore
}

interface State {
  selectedCategory: Category | null
}

@inject((allStores: IAllStore) => ({
  userStore: allStores.userStore as IUserStore,
  partyStore: allStores.partyStore as IPartyStore,
}))
@observer
class PartyListPage extends React.Component<Props, State> {
  state = {
    selectedCategory: null,
  }

  componentDidMount() {
    this.initializeParties()
  }

  componentWillUnmount() {
    unsubscribeTodayParties()
  }

  async initializeParties() {
    const { initializeParties } = this.props.partyStore!

    initializeParties()
  }

  filteredParties = (selectedCategory: Category, parties: Party[]): Party[] => (
    parties.filter((party: Party) => (
      selectedCategory.id === party.category.id
    ))
  )

  handleCategorySelect = (selectedCategory: Category) => {
    this.setState({
      selectedCategory: this.state.selectedCategory !== selectedCategory ? selectedCategory : null,
    })
  }
  render() {
    const { selectedCategory } = this.state
    const { user } = this.props.userStore!
    const { initializedParty, parties } = this.props.partyStore!

    return (
      <div className="PartyListContainer App__contents container album py-5">
        {
          !initializedParty && (
            <h3 className="App__text-black">파티를 불러오는 중</h3>
          )
        }
        {
          initializedParty && parties && (
            <React.Fragment>
              <h3 className="App__text-black">
                어떤파티를 찾나요? 🎉
                <Categories selectedCategory={selectedCategory} onSelect={this.handleCategorySelect}
                />
              </h3>
              <h3 className="App__text-black">
                다가오는 파티 <span role="img" aria-label="eyes">👀</span>
              </h3>
            </React.Fragment>
          )
        }

        {initializedParty && parties && (
          <React.Fragment>
            <PartyList
              user={user}
              parties={selectedCategory ? this.filteredParties(selectedCategory, parties) : parties}
            />
            <Link to="/parties/new">
              <button className="App__button make">파티만들기</button>
            </Link>
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default PartyListPage

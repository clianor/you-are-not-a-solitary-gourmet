import * as React from 'react'
import * as moment from 'moment'
import styled from 'styled-components'

import {
  subscribeComments,
  unsubscibeComments,
  savePartyComment,
  removePartyComment,
} from './utils/partyComments'

import GifSearch from './GifSearch'

import { stripScripts } from './utils/misc'

import './PartyComments.css'

type Props = {
  partyId: string,
  user: User | null,
}

type State = {
  visibleGifSearch: boolean,
  insertedComment: string,
  editComment: string,
  partyComments: PartyComment[],
  editCommentIndex: number,
  nowEditCommentUpdating: boolean,
}

const CommentActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export default class PartyComments extends React.Component<Props, State> {
  $editInput: HTMLInputElement | null = null

  state = {
    visibleGifSearch: false,
    insertedComment: '',
    editComment: '',
    partyComments: [],
    editCommentIndex: -1,
    nowEditCommentUpdating: false,
  }

  componentDidMount() {
    subscribeComments(this.props.partyId, (partyComments: PartyComment[]) => {
      this.setState({ partyComments })
    })
  }

  componentDidUpdate() {
    if (this.$editInput) {
      this.$editInput.focus()
      this.$editInput = null
    }
  }

  componentWillUnmount() {
    unsubscibeComments()
  }

  async asyncSetState(state: any) {
    return new Promise((resolve: any) => this.setState(state, resolve))
  }

  handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    // 낙관적 업데이트
    const { partyComments, insertedComment } = this.state
    const { partyId, user } = this.props

    if (user) {
      const insertComment = {
        partyId,
        user,
        content: insertedComment,
      }

      await this.asyncSetState({
        partyComments: partyComments ? [...partyComments, insertComment] : [insertComment],
        insertedComment: '',
      })
      await savePartyComment(insertComment)
    }
  }

  handleCommentEditClick = (index: number) => {
    const { partyComments } = this.state

    if (partyComments && partyComments[index]) {
      const editTargetComment = partyComments[index] as PartyComment
      this.setState({
        editComment: editTargetComment.content,
        editCommentIndex: index,
      })
    }
  }

  handleCommentEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await this.asyncSetState({
      nowEditCommentUpdating: true,
    })

    const { partyComments, editCommentIndex, editComment } = this.state
    const updateTargetComment = partyComments[editCommentIndex] as PartyComment

    if (updateTargetComment) {
      const { id, partyId, user } = updateTargetComment
      const updateComment = {
        id,
        partyId,
        user,
        content: editComment,
      }

      await savePartyComment(updateComment)
    }

    await this.asyncSetState({
      nowEditCommentUpdating: false,
      editComment: '',
      editCommentIndex: -1,
    })
  }

  handleCommentRemoveClick = async (commentId: string | undefined, index: number) => {
    if (commentId && this.state.partyComments) {
      // 낙관적 업데이트
      const partyComments = [...this.state.partyComments]
      partyComments.splice(index, 1)
      await this.asyncSetState({ partyComments })
      await removePartyComment(commentId)
    }
  }

  handleGifClick = () => {
    this.setState({
      visibleGifSearch: !this.state.visibleGifSearch
    })
  }

  handleAddGifComment = async (gif: Giphy) => {
    await this.asyncSetState({
      visibleGifSearch: false
    })

    // 낙관적 업데이트
    const { partyId, user } = this.props

    if (user) {
      const { images } = gif
      const { fixedHeight } = images
      const { url, width, height } = fixedHeight

      const content = `<img src="${url}" width="${width}" height="${height}" />`
      const gifComment = {
        partyId,
        user,
        content
      }
      
      const { partyComments } = this.state

      await this.asyncSetState({
        partyComments: partyComments ? [...partyComments, gifComment] : [gifComment]
      })
      await savePartyComment(gifComment)
    }

  }
  renderMoment(comment: PartyComment) {
    const momentTarget = comment.isEdited ? comment.updatedAt : comment.createdAt

    if (momentTarget) {
      return moment(momentTarget.toDate()).fromNow()
    }

    return null
  }

  render() {
    const {
      visibleGifSearch,
      partyComments,
      insertedComment,
      editCommentIndex,
      editComment,
      nowEditCommentUpdating,
    } = this.state
    const { user } = this.props

    return (
      <div className="PartyComments">
        <ul className="PartyComments__list">
          {partyComments !== null && partyComments.length === 0 && (
            <li className="PartyComments__nocomment">
              <span role="img" aria-label="cry-face">😢</span> 이 파티에 대한 댓글이 하나도 없네요.</li>
          )}
          {partyComments !== null && partyComments.length > 0 && (
            <li className="PartyComments__comment">{partyComments.length}개의 댓글이 있습니다.</li>
          )}
          {partyComments && partyComments.map((comment: PartyComment, i: number) => (
            <li key={i} className="PartyComments__comment PartyComments__comment--input">
              <img
                className="PartyComments__userImage"
                src={comment.user.photoURL}
                alt={`${comment.user.displayName} profile`}
              />
              <div className="PartyComments__group">
                <div className="PartyComments__commentUser comment-text">
                  <span>{comment.user.displayName}</span>
                  {user &&
                    comment.createdBy === user.email &&
                    <div className="PartyComments__buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => this.handleCommentEditClick(i)}>수정</button>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => this.handleCommentRemoveClick(comment.id, i)}>삭제</button>
                    </div>
                  }
                </div>
                <div className="PartyComments__commentContent comment-text">
                  {
                    editCommentIndex === i ?
                      (
                        <form onSubmit={this.handleCommentEditSubmit}>
                          <input
                            ref={input => this.$editInput = input}
                            className="PartyComments__commentline"
                            type="text"
                            value={editComment}
                            disabled={nowEditCommentUpdating}
                            onChange={(e: React.FormEvent<HTMLInputElement>) =>
                              this.setState({
                                editComment: e.currentTarget.value,
                              })}
                            onBlur={this.handleCommentEditSubmit}
                          />
                        </form>
                      ) : (
                        <React.Fragment>
                          <p className="PartyComments__commentline">
                            {comment.isEdited ? (
                              <span className="PartyComments__edited">(edited)</span>
                            ) : ''}
                            <div dangerouslySetInnerHTML={{ __html: stripScripts(comment.content) }} />
                          </p>
                          <div className="partyComments__createdAt comment-text">
                            {this.renderMoment(comment)}
                          </div>
                        </React.Fragment>
                      )
                  }
                </div>
              </div>
            </li>
          ))}

          <li className="PartyComments__comment PartyComments__comment--input">
            {user &&
              <img className="PartyComments__userImage" src={user.photoURL} alt={`${user.displayName} profile`} />
            }
            <div className="PartyComments__group">
              <form onSubmit={this.handleAddComment}>
                <input
                  type="text"
                  className="MakeParty__form-control form-control"
                  value={insertedComment}
                  disabled={!user}
                  placeholder={user ? '이 파티에 대해 길 수 있어요.' : '로그인 후 파티에 대한 의견을 남길 수 있습나다.'}
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    this.setState({
                      insertedComment: e.currentTarget.value,
                    })}
                />
              </form>
            </div>
          </li>
          {user &&
            <CommentActions>
              <button
                className="btn btn-md btn-info"
                type="button"
                onClick={this.handleGifClick}>add gif</button>
            </CommentActions>
          }
          {visibleGifSearch &&
            <GifSearch
              onSelect={this.handleAddGifComment}
              onClose={() => this.setState({ visibleGifSearch: false })}
            />
          }
        </ul>
      </div>
    )
  }
}

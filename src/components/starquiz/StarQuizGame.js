import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import StarQuizDetailsModal from './starQuizDetailsModal'
import StarQuizCharacterModal from './starQuizCharacterModal'
import Pagination from "../../template/Pagination";
import helmetLogo from '../../assets/imgs/helmet-logo.png'

import TimerMachine from 'react-timer-machine'
import moment from "moment"
import momentDurationFormatSetup from "moment-duration-format"

const LIMIT_PER_PAGE = 9;

class StarQuizGame extends Component {
    constructor(props) {
        super(props)

        this.state = {
            timerStarted: true,
            timerPaused: false,

            allCharacters: [],
            currentCharacters: [],
            currentPage: null,
            totalPages: null,

            showDetailsModal: false,
            characterDetails: null,
            showCharacterModal: false,
            characterIndex: false,

            score: []
        };
    }

    componentDidMount() {
        // Parse props to state of the characters
        const tempAllCharacter = this.props.characters;
        const tempScore = [];
        for (let i = 0; i < tempAllCharacter.length; i++) {
            tempAllCharacter[i].edited = false;

            //  Building score oject state
            let buildScore = { name: tempAllCharacter[i].name, answer: null, tip: false }
            tempScore.push(buildScore);
        }
        this.setState({ allCharacters: tempAllCharacter, score: tempScore });
    }

    onPageChanged = data => {
        const { allCharacters } = this.state;
        const { currentPage, totalPages, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const currentCharacters = allCharacters.slice(offset, offset + pageLimit);

        this.setState({ currentPage, currentCharacters, totalPages });
    };

    /* Open details modal */
    openDetailsModal = (index) => {
        // Set tip to true on the score
        const tempScore = this.state.score;
        tempScore[index].tip = true;

        this.setState({ timerPaused: true, showDetailsModal: true, characterDetails: this.state.allCharacters[index], score: tempScore });
    }

    /* Close details modal */
    closeDetailsModal = () => {
        this.setState({ timerPaused: false, showDetailsModal: false, characterDetails: null });
    }

    /* Open character modal */
    openCharacterModal = (index) => {
        this.setState({ timerPaused: true, showCharacterModal: true, characterIndex: index });
    }

    /* Close character modal */
    closeCharacterModal = () => {
        this.setState({ timerPaused: false, showCharacterModal: false, characterIndex: null });
    }

    /* Confirm character modal */
    confirmCharacterModal = (values) => {
        // Set edited attribute on the character state
        const tempAllCharacter = this.state.allCharacters;
        tempAllCharacter[this.state.characterIndex].edited = true;

        // Set the answer on the score state
        const tempScore = this.state.score;
        tempScore[this.state.characterIndex].answer = values.name;

        this.setState({ timerPaused: false, showCharacterModal: false, characterIndex: null, allCharacters: tempAllCharacter, score: tempScore });
    }

    scoreCalc = () => {
        let result = 0;

        for (let i = 0; i < this.state.score.length; i++) {
            if (this.state.score[i].answer !== null) {
                if (this.state.score[i].name.toUpperCase() === this.state.score[i].answer.toUpperCase()) {
                    if (this.state.score[i].tip) {
                        result += 10;
                    } else {
                        result += 20;
                    }
                }
            }
        }
        return result;
    }

    render() {
        const { timerStarted, timerPaused, allCharacters, currentCharacters, currentPage, totalPages } = this.state;
        const totalCharacters = allCharacters.length;
        const headerClass = ["text-dark py-2 pr-4 m-0", currentPage ? "border-gray border-right" : ""].join(" ").trim();

        return (
            <div className='container' >

                {totalCharacters !== 0 ? (
                    <div className='container-aux'>
                        {/* Header */}
                        <div className='row'>
                            <div className='col-md-7'>
                                <img className='helmet-game-img' src={helmetLogo} alt='Star Wars Helmet' />
                                <h1 className='starquiz-game-label'>StarQuiz Game!</h1>
                            </div>
                            <div className='col-md-5'>
                                <h1 className='game-timer'><i className="fa fa-clock-o game-clock-icon" />&nbsp;
                                    <TimerMachine
                                        timeStart={15 * 1000} // start at 2 minutes
                                        timeEnd={0} // end at 0 seconds
                                        started={timerStarted}
                                        paused={timerPaused}
                                        countdown={true} // use as stopwatch
                                        interval={1000} // tick every 1 second
                                        formatTimer={(time, ms) =>
                                            moment.duration(ms, "milliseconds").format("h:mm:ss")
                                        }
                                        onComplete={time =>
                                            console.log(this.scoreCalc())
                                        }
                                    />
                                </h1>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className='row'>
                            <div className="d-flex flex-row align-items-center total-pages">
                                <h2 className={headerClass}>
                                    <strong className="text-secondary">{totalCharacters}</strong>{" "} Personagens
                                    </h2>
                                {currentPage && (
                                    <span className="current-page d-inline-block h-100 pl-4 text-secondary">
                                        Página <span className="font-weight-bold">{currentPage}</span> /{" "}
                                        <span className="font-weight-bold"> {totalPages}</span>
                                    </span>
                                )}
                            </div>
                            <Pagination
                                totalRecords={totalCharacters}
                                pageLimit={LIMIT_PER_PAGE}
                                pageNeighbours={1}
                                onPageChanged={this.onPageChanged}
                            />
                        </div>

                        {/* Cards */}
                        <div className='row'>
                            {currentCharacters.map((item, index) => (
                                <div className='col-md-3 card-col' key={index}>
                                    <div className={'card card-custom' + (item.edited ? ' card-answered' : '')}>
                                        <img className='card-img-top' src={item.url} alt='Card image cap' />
                                        <div className='card-body'>
                                            <p className='card-text'>{item.name}</p>
                                            <button type='button' className='btn btn-secondary btn-card' title='Inserir Nome' disabled={item.edited}
                                                onClick={() => this.openCharacterModal(((currentPage - 1) * LIMIT_PER_PAGE) + index)}>?</button>
                                            <button type='button' className='btn btn-secondary btn-card btn-card-info' title='Detalhes'
                                                onClick={() => this.openDetailsModal(((currentPage - 1) * LIMIT_PER_PAGE) + index)}>...</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div >

                        { /* Details Modal */
                            this.state.showDetailsModal ? (
                                <StarQuizDetailsModal cancelDetailsModal={() => this.closeDetailsModal()}
                                    character={this.state.characterDetails} />
                            ) : null
                        }

                        { /* Character Modal */
                            this.state.showCharacterModal ? (
                                <StarQuizCharacterModal cancelCharacterModal={() => this.closeCharacterModal()} confirmForm={(values) => { this.confirmCharacterModal(values) }} />
                            ) : null
                        }
                    </div >
                ) : (
                        <div className='row'>
                            <a className='game-label-redirect' href='/#/'>Para jogar retorne a tela inicial</a>
                        </div >
                    )
                }
            </div >
        )
    }
}

function mapStateToProps(state) {
    return {
        characters: state.app.characters
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StarQuizGame)
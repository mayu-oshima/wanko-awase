import {useState, useEffect, useMemo, MouseEvent, ChangeEvent} from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

export const App = () => {
  //開いているページ
  const [page, setpage] = useState<string>('top');

  //レベル
  type levelType = {
    en: string;
    ja: string;
  }
  const [level, setLevel]  = useState<levelType>({
    en: 'easy',
    ja: '易しい',
  });

  //タイマー
  type timeStateType = {
    time: number;
    key: any;
  };
  const [timeState, setTimeState] = useState<timeStateType>({
    time: 0,
    key: null,
  });

  //処理中かどうかのフラグ
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  //カードの状態
  type cardStateType = {
    set: number,
    shuffled: {
      src: string;
      id: number;
    }[],
    first: number;
    flipped: number[];
    clear: number[];
  }
  const [cardState, setCardState] = useState<cardStateType>({
    set: 0,
    shuffled: [],
    first: 0,
    flipped: [],
    clear: [],
  });

  //クリア画面
  const [gameClear, setgameClear] = useState<boolean>(false);


  const Cards: string[] = useMemo(() => [
    './images/game/dogs/dog-01.jpg',
    './images/game/dogs/dog-02.jpg',
    './images/game/dogs/dog-03.jpg',
    './images/game/dogs/dog-04.jpg',
    './images/game/dogs/dog-05.jpg',
    './images/game/dogs/dog-06.jpg',
    './images/game/dogs/dog-07.jpg',
    './images/game/dogs/dog-08.jpg',
    './images/game/dogs/dog-09.jpg',
  ], []);

  useEffect(() => {
    if(page === 'game') {
      //ゲームページ
      if(level.en === 'easy') {
        setCardState(prev => ({...prev, set: 3}));
        setLevel(prev => ({...prev, ja: '易しい'}));
      } else if (level.en === 'normal') {
        setCardState(prev => ({...prev, set: 4}));
        setLevel(prev => ({...prev, ja: '普通'}));
      } else if (level.en === 'hard') {
        setCardState(prev => ({...prev, set: 5}));
        setLevel(prev => ({...prev, ja: '難しい'}));
      }

      //タイマーカウント開始
      const key = setInterval(function(){
        setTimeState(prev => ({...prev, time: Math.round((prev.time + .01) * 100) /100}));
      }, 10);
      setTimeState(prev => ({...prev, key: key}));

    } else if (page === 'top') {
      //TOPページ
      clearInterval(timeState.key);
      setTimeState({
        time: 0,
        key: null,
      });
      setTimeState({
        time: 0,
        key: null,
      });
      setCardState({
        set: 0,
        shuffled: [],
        first: 0,
        flipped: [],
        clear: [],
      });
      setgameClear(false);
    }
  }, [page, level.en]);

  //カードをランダムに選出して2枚ずつにしてシャッフルしたカードをshuffledCardsにセット
  useEffect(() => {
    const copyCards = [...Cards];
    type CardListType = {
      src: string;
      id: number;
    }
    let CardList: CardListType[] = [];
    for(let i = 0; i < cardState.set; i++) {
      const randomIndex = Math.floor(Math.random() * copyCards.length);
      CardList.push({src: copyCards[randomIndex], id: i+1});

      //同じカードが選ばれないように配列から削除
      copyCards.splice(randomIndex, 1);
    }

    //同じカードをもう一枚ずつ追加
    CardList.push(...CardList);

    //カードをシャッフル
    for(let i = CardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [CardList[i], CardList[j]] = [CardList[j], CardList[i]];
    }
    setCardState((prev) => ({...prev, shuffled: CardList}));
  }, [cardState.set, Cards]);


  //カードをタップしたときに動く関数
  const tapCard = async(e:MouseEvent<HTMLLIElement>) => {
    if(isProcessing) return;

    const sleep = (ms:number) => new Promise ((resolve) => setTimeout(resolve, ms));

    setIsProcessing(true);

    const index = Number(e.currentTarget.dataset.index);
    setCardState(prev => ({...prev, flipped: [...cardState.flipped, index]}));

    const id = Number(e.currentTarget.dataset.id);

    if(cardState.first) {
      if(cardState.first === id) {
        //あたり
        await sleep(1200);
        const newclearCards = [...cardState.clear, id];
        setCardState(prev => ({...prev, clear: newclearCards}));

        //全てのカードが正解になったらクリア画面が出現
        if(cardState.set === newclearCards.length) {
          clearInterval(timeState.key);
          setgameClear(true);
        }
      } else {
        //はずれ
        await sleep(1000);
        const newFlippedCards = [...cardState.flipped];
        newFlippedCards.splice(-2,2);
        setCardState(prev => ({...prev, flipped: newFlippedCards}));
      }
      setCardState(prev => ({...prev, first: 0}));
    } else {
      setCardState(prev => ({...prev, first: id}));
    }
    setIsProcessing(false);
  };

  return (
    <>
      <GlobalStyle />
      {page === 'top' ? (
        <STop>
          <div className='content'>
            <SInner>
              <h1 className='ttl'><img src="./images/index/ttl.png" alt="わんこあわせ" /></h1>
              <div className='start_box'>
                <p className='text'>レベルを選択</p>
                <div>
                  <SelectWrapper>
                    <SSelectLevel
                      value={level.en}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setLevel((prev) => ({ ...prev, en: e.target.value }))
                      }
                    >
                      <option value="easy">易しい</option>
                      <option value="normal">普通</option>
                      <option value="hard">難しい</option>
                    </SSelectLevel>
                    <Arrow>▼</Arrow>
                  </SelectWrapper>
                </div>
                <div>
                  <div className='btn_start' onClick={() => setpage('game')}>START</div>
                </div>
              </div>
            </SInner>
          </div>
        </STop>
      ):(
        <>
          <SInner>
            <STimer>
              <img src="./images/game/icon_timer.png" alt="" />
              <p>{timeState.time.toFixed(2)}</p>
            </STimer>
            <SWrapCard levelEn={level.en}>
              {
                cardState.shuffled.map((card, index) => (
                  <SCardBack onClick={tapCard} data-id={card.id} data-index={index} flipped={cardState.flipped.includes(index)} cleared={cardState.clear.includes(card.id)} levelEn={level.en}>
                    <SCardFront src={card.src} alt="" />
                  </SCardBack>
                ))
              }
            </SWrapCard>
            <SbuttonWrap>
              <Sbutton onClick={() => setpage('top')}>ゲームを終了する</Sbutton>
            </SbuttonWrap>

            <SClear gameClear={gameClear}>
              <SClearBox>
                <SClearBoxTtl>CLEAR</SClearBoxTtl>
                <SClearBoxTime>タイム : <span className='time'>{timeState.time.toFixed(2)}<span className='unit'>秒</span></span></SClearBoxTime>
                <SClearBoxDeco01><img src="/images/game/deco/deco_01.png" alt="" /></SClearBoxDeco01>
                <SClearBoxLevel>{level.ja}</SClearBoxLevel>
                <SbuttonWrap>
                  <Sbutton onClick={() => setpage('top')}>TOPへ戻る</Sbutton>
                </SbuttonWrap>
                <SClearBoxDeco02><img src="/images/game/deco/deco_02.png" alt="" /></SClearBoxDeco02>
                <SClearBoxDeco03><img src="/images/game/deco/deco_03.png" alt="" /></SClearBoxDeco03>
              </SClearBox>
            </SClear>
          </SInner>
        </>
      )}
    </>
  );
};

const GlobalStyle = createGlobalStyle`
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    font-size: 10px;
  }
  body {
    font-family: "游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic", sans-serif;
    font-size: 16px;
    color: #311e08;
  }
  button, select {
    color: #311e08;
  }
`;

const SInner = styled.div`
  width: 980px;
  margin: 0 auto;
  @media (max-width: 979px) {
    width: 95%;
  }
`;

const SbuttonWrap = styled.div`
  margin-top: 70px;
  text-align: center;
  @media (max-width: 979px) {
    margin-top: 40px;
  }
`;

const Sbutton = styled.button`
  background-color: #ffefc6;
  padding: 8px 25px;
  padding-right: 50px;
  border: none;
  border-radius: 999px;
  font-size: 1.7rem ;
  font-weight: 500;
  transition: all .3s ease;
  cursor: pointer;
  position: relative;
  @media (max-width: 979px) {
    padding: 6px 20px;
    padding-right: 40px;
    font-size: 1.5rem ;
  }
  &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 50%;
    right: 25px;
    translate: 0 -50%;
    width: 9px;
    height: 9px;
    border-color: #311e08;
    border-style: solid;
    border-width: 1px 1px 0 0;
    rotate: 45deg;
    @media (max-width: 979px) {
      right: 20px;
      width: 6px;
      height: 6px;
    }
  }
  @media (min-width: 980px) {
    &:hover {
      scale: 1.1;
    }
  }
`;

const huwahuwa = keyframes`
  0% {
    translate: 0 0;
  }
  50% {
    translate: 0 -30px;
  }
  100% {
    translate: 0 0;
  }
`;

const top_ttl = keyframes`
  0% {
    translate: 0 0;
    filter: drop-shadow(0 0 0px rgb(12 50 64 / .35));
    scale: .95;
  }
  50% {
    translate: 0 -15px;
    filter: drop-shadow(8px 8px 7px rgb(12 50 64 / .35));
    scale: 1;
  }
  100% {
    translate: 0 0;
    filter: drop-shadow(0 0 0 rgb(12 50 64 / .35));
    scale: .95;
  }
`;


const STop = styled.div`
  background: url(/images/index/bg.png) no-repeat center top / cover;
  width: 100vw;
  height: 100vh;
  @media (max-width: 979px) {
    background: url(/images/index/bg_sp.png) no-repeat center top / cover;
  }
  .content {
    padding-top: 10vw;
    text-align: center;
    @media (max-width: 979px) {
      padding-top: 40vw;
      padding-top: min(40vw, 200px);
    }
    .ttl {
      text-align: center;
      margin-bottom: 40px;
      filter: drop-shadow(8px 8px 7px rgb(12 50 64 / .35));
      animation: ${top_ttl} 3s ease infinite;
      @media (max-width: 979px) {
        width: 90%;
        max-width: 330px;
        margin: 0 auto 20px;
        img {
          width: 100%;
        }
      }
    }
    .start_box {
      filter: drop-shadow(8px 8px 7px rgb(12 50 64 / .35));
      padding: 55px;
      width: 480px;
      height: 326px;
      display: inline-block;
      background: url(/images/index/start_bg.png) no-repeat center top / contain;
      @media (max-width: 979px) {
        padding: 30px;
        height: 202.5px;
        width: 300px;
      }
      .text {
        font-size: 2.2rem;
        font-weight: 700;
        margin-bottom: 20px;
        @media (max-width: 979px) {
          font-size: 1.7rem;
          margin-bottom: 13px;
        }
      }
      .btn_start {
        font-size: 3.732rem;
        background-color: #e15226;
        color: #fff;
        font-weight: 700;
        border-radius: 999px;
        display: inline-block;
        padding: 10px 60px;
        line-height: 1;
        margin-top: 40px;
        transition: all .3s ease;
        cursor: pointer;
        @media (max-width: 979px) {
          font-size: 2.2rem;
          padding: 7px 60px;
          margin-top: 23px;
        }
        @media (min-width: 980px) {
          &:hover {
            scale: 1.1;
          }
        }
      }
    }
  }
`;


const SelectWrapper = styled.div`
  position: relative;
  width: 200px;
  margin: 0 auto;
  @media (max-width: 979px) {
    width: 150px;
  }
`;

const SSelectLevel = styled.select`
  color: #311e08;
  cursor: pointer;
  font-size: 3.195rem;
  font-weight: 700;
  padding: 5px 30px;
  border-radius: 5px;
  border: 2px solid #333;
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  @media (max-width: 979px) {
    font-size: 2.5rem;
    padding: 3px 25px;
    border-radius: 3px;
  }
`;

const Arrow = styled.span`
  position: absolute;
  top: 50%;
  right: 12px;
  pointer-events: none;
  transform: translateY(-50%);
  font-size: 24px;
  color: #333;
  @media (max-width: 979px) {
    font-size: 17px;
  }
`;



const STimer = styled.div`
  margin: 30px 0 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  @media (max-width: 979px) {
    font-size: 2.0rem;
  }
  img {
    width: 25px;
    margin-right: 10px;
    @media (max-width: 979px) {
      width: 17px;
      margin-right: 7px;
    }
  }
`;

const SWrapCard = styled.ul<{levelEn: string}>`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: ${props => {
    if(props.levelEn === 'easy') return '500px';
    if(props.levelEn === 'normal') return '673px';
    if(props.levelEn === 'hard') return '845px';
  }};
  margin: 0 auto;
  padding: 0;
  @media (max-width: 980px) {
    width: 100%;
  }
`;

type TCardBack = {
  flipped: boolean;
  cleared: boolean;
  levelEn: string;
}

const SCardBack = styled.li<TCardBack>`
  position: relative;
  border-radius: 10px;
  background-color: #82c5ff;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  width: 155px;
  transform: ${props => (props.flipped ? 'rotateY(180deg)' : 'rotateY(0)')};
  opacity: ${props => (props.cleared ? '0' : '1')};
  transition: all .3s ease;
  list-style-type: none;
  cursor: pointer;
  @media (min-width: 980px) {
    ${props => {
      if(props.levelEn === 'easy') {
        return `
          &:nth-child(n+4) {
            margin-top: 10px;
          }
        `;
      } else if(props.levelEn === 'normal') {
        return `
          &:nth-child(n+5) {
            margin-top: 10px;
          }
        `;
      } else if(props.levelEn === 'hard') {
        return `
          &:nth-child(n+6) {
            margin-top: 10px;
          }
        `;
      }
    }}
  }
  @media (max-width: 979px) {
    &:nth-child(n+4) {
      margin-top: 10px;
    }
    width: 32%;
  }
  &::after {
    backface-visibility: hidden;
    content: '';
    display: block;
    width: 64px;
    height: 44px;
    background: url(/images/game/card_mark_paws.png) no-repeat center center / contain;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    @media (max-width: 979px) {
      width: 48px;
      height: 33px;
    }
  }
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border: 5px solid #31689a;
    border-radius: 10px;
    position: absolute;
    top: 0;
    left: 0;
    @media (max-width: 979px) {
      border-radius: 8px;
      border-width: 4px;
    }
  }
`;


const SCardFront = styled.img`
  transform: rotateY(180deg);
  width: 100%;
  display: block;
  backface-visibility: hidden;
  border-radius: 10px;
  border: 5px solid #31689a;
  @media (max-width: 979px) {
    border-radius: 8px;
    border-width: 4px;
  }
`;

const SClear = styled.div<{gameClear: boolean}>`
  background-color: rgb(0 0 0 / .3);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: all .3s ease;
  ${props => props.gameClear ?
    `
      opacity: 1;
      pointer-events: auto;
    ` : `
      opacity: 0;
      pointer-events: none;
    `
  }
`;

const SClearBox = styled.div`
  background-color: #fff;
  border-radius: 20px;
  min-width: 400px;
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  text-align: center;
  padding: 40px;
  box-sizing: border-box;
  font-weight: 700;
  @media (max-width: 979px) {
    border-radius: 15px;
    min-width: 0;
    max-width: 70%;
    padding: 20px;
  }
  p {
    margin: 0;
  }
  ${SbuttonWrap} {
    margin-top: 20px;
  }
`;

const SClearBoxTtl = styled.div`
  font-size: 6.558rem ;
  @media (max-width: 979px) {
    font-size: 3.558rem ;
  }
`;

const SClearBoxTime = styled.div`
  font-size: 2.887rem;
  white-space: nowrap;
  @media (max-width: 979px) {
    font-size: 2rem;
  }
  .time {
    font-size: 140%;
    color: #de315f;
    .unit {
      font-size: 60%;
      margin-left: 3px;
    }
  }
`;

const SClearBoxDeco01 = styled.div`
  margin: -30px 0 30px;
  width: 500px;
  @media (max-width: 979px) {
    width: 100%;
    margin: 0px 0 15px;
  }
  img {
    width: 100%;
  }
`;

const SClearBoxLevel = styled.div`
  font-size: 2.387rem;
  background-color: #ffc3d3;
  border-radius: 999px;
  margin-top: 10px;
  @media (max-width: 979px) {
    font-size: 1.7rem;
  }
`;

const SClearBoxDeco02 = styled.div`
  position: absolute;
  right: calc(100% + 30px);
  top: 10px;
  width: 120px;
  animation: ${huwahuwa} 4s ease infinite;
  @media (max-width: 979px) {
    top: 5px;
    right: calc(100% - 7px);
    width: 80px;
  }
  img {
   width: 100%;
  }
`;

const SClearBoxDeco03 = styled.div`
  position: absolute;
  left: calc(100% + 30px);
  top: 10px;
  width: 120px;
  animation: ${huwahuwa} 4s ease infinite;
  animation-delay: 1s;
  @media (max-width: 979px) {
    top: 5px;
    left: calc(100% - 7px);
    width: 80px;
  }
  img {
   width: 100%;
  }
`;
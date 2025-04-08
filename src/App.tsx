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
    './images/dog-01.jpg',
    './images/dog-02.jpg',
    './images/dog-03.jpg',
    './images/dog-04.jpg',
    './images/dog-05.jpg',
    './images/dog-06.jpg',
    './images/dog-07.jpg',
    './images/dog-08.jpg',
    './images/dog-09.jpg',
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
        await sleep(1200);
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
        <>
          <STopTtl>わんこあわせ</STopTtl>
          <STopText>レベルを選択してスタート！！</STopText>
          <SWrapSelectLevel>
            <SSelectLevel value={level.en} onChange={(e: ChangeEvent<HTMLSelectElement>) => setLevel(prev => ({...level, en: e.target.value}))}>
              <option value="easy">易しい</option>
              <option value="normal">普通</option>
              <option value="hard">難しい</option>
            </SSelectLevel>
            <Sbutton onClick={() => setpage('game')}>スタート</Sbutton>
          </SWrapSelectLevel>
        </>
      ):(
        <>
          <SInner>
            <STimer>
              <img src="./images/icon_timer.png" alt="" />
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
                <SClearBoxTime>タイム : <span>{timeState.time.toFixed(2)}秒</span></SClearBoxTime>
                <SClearBoxDeco01><img src="/images/deco/deco_01.png" alt="" /></SClearBoxDeco01>
                <SClearBoxLevel>{level.ja}</SClearBoxLevel>
                <SbuttonWrap>
                  <Sbutton onClick={() => setpage('top')}>TOPへ戻る</Sbutton>
                </SbuttonWrap>
                <SClearBoxDeco02><img src="/images/deco/deco_02.png" alt="" /></SClearBoxDeco02>
                <SClearBoxDeco03><img src="/images/deco/deco_03.png" alt="" /></SClearBoxDeco03>
              </SClearBox>
            </SClear>
          </SInner>
        </>
      )}
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 10px;
  }
  body {
    font-family: "游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic", sans-serif;
    font-size: 16px;
    color: #311e08;
  }
`;

const SInner = styled.div`
  width: 980px;
  margin: 0 auto;
`;

const SbuttonWrap = styled.div`
  margin-top: 70px;
  text-align: center;
`;

const STopTtl = styled.h1`
  text-align: center;
  font-size: 6.0rem;
`;

const STopText = styled.p`
  text-align: center;
`;

const SWrapSelectLevel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SSelectLevel = styled.select`
  margin-right: 20px;
`;

const Sbutton = styled.button`
  background-color: #ffefc6;
  padding: 8px 40px;
  border: none;
  border-radius: 999px;
  font-size: 1.7rem ;
  font-weight: 500;
  position: relative;
  &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 50%;
    right: 15px;
    translate: 0 -50%;
    width: 9px;
    height: 9px;
    border-color: #311e08;
    border-style: solid;
    border-width: 1px 1px 0 0;
    rotate: 45deg;
  }
`;

const STimer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  img {
    width: 25px;
    margin-right: 10px;
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
`;

type TCardBack = {
  flipped: boolean;
  cleared: boolean;
  levelEn: string;
}

const SCardBack = styled.li<TCardBack>`
  background-color: #82c5ff;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  width: 155px;
  transform: ${props => (props.flipped ? 'rotateY(180deg)' : 'rotateY(0)')};
  opacity: ${props => (props.cleared ? '0' : '1')};
  transition: all .3s ease;
  list-style-type: none;
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
`;


const SCardFront = styled.img`
  transform: rotateY(180deg);
  width: 100%;
  display: block;
  backface-visibility: hidden;
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
  p {
    margin: 0;
  }
`;

const SClearBoxTtl = styled.div`
  font-size: 6.558rem ;
`;

const SClearBoxTime = styled.div`
  font-size: 2.887rem;
  span {
    font-size: 140%;
    color: #de315f;
  }
`;

const SClearBoxDeco01 = styled.div`
    margin: -30px 0 30px;
    width: 500px;
  img {
    width: 100%;
  }
`;

const SClearBoxLevel = styled.div`
  font-size: 2.387rem;
  background-color: #ffc3d3;
  border-radius: 999px;
  margin-top: 10px;
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

const SClearBoxDeco02 = styled.div`
  position: absolute;
  right: calc(100% + 30px);
  top: 10px;
  width: 120px;
  animation: ${huwahuwa} 4s ease infinite;
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
  img {
   width: 100%;
  }
`;
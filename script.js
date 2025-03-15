function setup() {
	date1=new Date();
	start=date1.getTime();

	picture=new Array(2,3);
	picture[0]=[0,1,2] //number
	picture[1]=['redmask','greenmask','bluemask']; //css bgcolor
	picture[2]=[0,1,2] //shading
	picture[3]=['oval.gif','square.gif','zigzag.gif']; //img src

	score=0;
	decksize=80;
	deck = new Array(decksize);
	for (i=0; i<=decksize; i++){
		deck[i]=i;
	}
	boardheight=3;
	boardwidth=2;
	board=new Array(boardheight,boardwidth);
	board[0]=[0,0,0];
	board[1]=[0,0,0];
	board[2]=[0,0,0];
	board[3]=[0,0,0];
	board[4]=[0,0,0];


	set=new Array(2,2,2);
	emptytheset();
	gameover=false;
	extrarows=false;


	// shuffle
	for (i=0; i<=decksize; i++){
		tmp = deck[i];
		swappos=Math.floor(Math.random()*decksize);
		deck[i]=deck[swappos];
		deck[swappos]=tmp;
	}

	// generate table
	var cardtableau = "";
	cardtableau += '<table>';
	for (row=0;row<=boardheight+1;row++){
		cardtableau += '<tr>';
		for (col=0;col<=boardwidth;col++)
		{
			if (row<=boardheight) 
			{
				cardtableau += '<td id="td' + row + col + '" onclick=clickcard(' + row + ',' + col + ') height="80" width="120" align="center"><div class="card" id="div' + row + col + '"><img src="blank.gif" id="img' + row + col + '" onclick=clickcard(' + row + ',' + col + ')></div></td>';
			} else {
				cardtableau += '<td id="td' + row + col + '" width="120" align="center"><div class="blank" id="div' + row + col + '"></div></td>';
				//adding another row of empty tds here, to fill on dealmorecards
			}	
			
		}
		cardtableau += '</tr>';	
	}
	cardtableau += '</table>';
	cardtableau += '<table><tr><td>Your score:</td><td id="score">' + score + '</td></tr>';
	cardtableau += '<tr><td>Cards remaining in deck:</td><td id="cards">' + (decksize+1) + '</td></tr>';
	cardtableau += '</table>';

	cardtableau += '<input type="button" id="button" onclick="clickmorecards()" value="Deal more cards!">';

	document.getElementById("gameboard").innerHTML = cardtableau;

	 //decksize=11;  //uncomment this to test endgame things


	//deal initial 12 cards
	for (row=0;row<=boardheight;row++){
		for (col=0;col<=boardwidth;col++){
			deal(row,col);
		}
	}
}


//--------------------------------------Functions

function deal(row, col){
	if (!gameover)
	{
		if (decksize>=0) 
		{
			board[row][col]=deck.pop();
			decksize--;
			displaycard(row,col);
		} else {
			//deal blanks
			displayblank(row,col);
			if (!checkforsets()) {
				alert ('You win! \n Time taken: ' + calctime() + ' seconds')
				gameover=true;
			}
		} 
		document.getElementById('cards').innerHTML = (decksize+1);
	}
}

function calctime(){
	date2=new Date();
	end=date2.getTime();
	return Math.round((end-start)/1000);
}

function displaycard (row,col) {
	imagehtml = '<img src="' + picture[2][ternary(board[row][col])[2]] + picture[3][ternary(board[row][col])[3]] + '" class="' + picture[1][ternary(board[row][col])[1]]+ '" id="img' + row + col + '"  >' 
	another = '<img src="' + picture[2][ternary(board[row][col])[2]] + picture[3][ternary(board[row][col])[3]] + '" class="' + picture[1][ternary(board[row][col])[1]]+ '">' 
	//shading depending on 3rd trit concat shape depending on 4th trit; colour depending on 2nd trit; number depending on 1st trit
	qty = picture[0][ternary(board[row][col])[0]];
	imagehtml = (qty==0 ? imagehtml : (qty==1 ? imagehtml + another : imagehtml + another + another));
	imagehtml = '<div class="card" id="div' + row + col + '"><BR>' + imagehtml + '</div>'
	document.getElementById('td' + row + col).innerHTML = imagehtml;
	document.getElementById('td' + row + col).onclick=function(){clickcard(row,col)};	
}

function displayblank (row,col)
{
	imagehtml = '<div class="blank" id="div' + row + col + '"><img src="blank.gif"></div>';
	document.getElementById('td' + row + col).innerHTML = imagehtml;
}


function clickcard(row,col){
	if (!gameover)
	{
		cardclass=document.getElementById('div' + row + col).className;
		if(cardclass!='selectedcard' && cardclass!='blank')	//if the card isn't already selected or blank...
		{
			selectcard(row,col);							//...then select it.
			if (setsize==3) compareset();					//if there are 3, compare them, and empty 
		} else if (cardclass=='selectedcard') { 			
			removecardfromset(row,col);						//if already selected, remove card from set
		} //else card is blank, so do nothing
	}
	document.getElementById('score').innerHTML = score;
}

function selectcard(row,col){
	//give that card a border
	document.getElementById('div' + row + col).className='selectedcard';
	//add it to set
	set[0][setsize]=board[row][col];
	set[1][setsize]=row;
	set[2][setsize]=col;
	setsize++;
}

function removecardfromset (row,col) {
	document.getElementById('div' + row + col).className='card';
	for (i=0;i<=setsize;i++) {
		if (set[1][i]==row && set[2][i]==col) {		//then i is the index of set where deselecting card is
			setsize--;								//i can only be 0 or 1. If 1, just reduce setsize.
			if (i==0) {								//If 0, then overwrite set[][0] with set[][1] as well.
				for (setindex=0;setindex<=2;setindex++) set[setindex][0]=set[setindex][1];
			}
		}
	}
}

function compareset() {
	if(compare(set[0])){
		acceptset();
	} else rejectset();
	//remove all select borders
	for (i=0;i<=2;i++){		//remove select border from card at set[1][i], set[2][i]
		if (document.getElementById('div' + set[1][i] + set[2][i]).className=='selectedcard')
		{
			document.getElementById('div' + set[1][i] + set[2][i]).className='card';
		}
	}
	emptytheset();
}

function acceptset() {
	alert ('Yes');
	score=score+3;
								//deal 3 replacement cards... 
	if(!extrarows) {			//into the spaces they were in, if still only 12
		for (i=0;i<=2;i++)
		{
			deal(set[1][i], set[2][i]); 
		}	
	} else {					//otherwise, if 15: move last 3 into spaces they were in:
		for (i=0;i<=2;i++) displayblank(set[1][i],set[2][i]);		//make all just-emptied td's blank
		for (i=0;i<=2;i++) 			// swap new blanks with final 3 non-blanks:
		{
			findfinalcard(); 		//ie final non-blank card
			if (set[1][i]<=boardheight) //if i is in original board size...
			{							//...then write content of final non-blank card into blank space i 
				board[set[1][i]][set[2][i]] = board[swaprow][swapcol];
				displayblank(swaprow,swapcol); //display blank in the final non-blank card
				displaycard(set[1][i],set[2][i]); //display content in newly-swapped spaces
			}
		
		}					
		extrarows=false;			//and set extrarows=false again
		document.getElementById('button').className=''; //and re-enable more cards button
	}
}

function rejectset() {
alert ('No');	
		score--;	
}


function findfinalcard() {
	swaprowcol=((boardheight + 2) * (boardwidth + 1)) - 1;
	swaprow=Math.floor(swaprowcol/(boardwidth+1));
	swapcol=swaprowcol-((boardwidth+1)*swaprow);		//final card in extended board size
	while (document.getElementById('div' + swaprow + swapcol).className!='card' )
	{
		swaprowcol--;
		swaprow=Math.floor(swaprowcol/(boardwidth+1));
		swapcol=swaprowcol-((boardwidth+1)*swaprow);
	}		//if final card is blank, search left until find non-blank card
}

function ternary(decnumber)
{
	var ternaryarray=new Array(4); //local
	ternaryarray=[0,0,0,0];
	for (power=3;power>=0;power--)
	{
		position=3-power;
		ternaryarray[position]=Math.floor(decnumber/(Math.pow(3,power)));
		decnumber = decnumber - (ternaryarray[position] * Math.pow(3,power));
	}
	return ternaryarray;
}

function checkforsets()
{
	var rowcol=new Array(2);
	var row = new Array(2);
	var col = new Array(2);
	checkset = new Array(2);
	for(rowcol[0]=0;rowcol[0]<=((boardwidth+1)*(boardheight+1) - 1);rowcol[0]++)
	{
		row[0]=Math.floor(rowcol[0]/(boardwidth+1));
		col[0]=rowcol[0]-((boardwidth+1)*row[0]);
		if(document.getElementById('div' + row[0] + col[0]).className!='blank')
		{
			for(rowcol[1]=rowcol[0]+1;rowcol[1]<=((boardwidth+1)*(boardheight+1) - 1);rowcol[1]++)
			{
				row[1]=Math.floor(rowcol[1]/(boardwidth+1));
				col[1]=rowcol[1]-((boardwidth+1)*row[1]);
				if(document.getElementById('div' + row[1] + col[1]).className!='blank')
				{
					for(rowcol[2]=rowcol[1]+1;rowcol[2]<=((boardwidth+1)*(boardheight+1) - 1);rowcol[2]++)
					{
						row[2]=Math.floor(rowcol[2]/(boardwidth+1));
						col[2]=rowcol[2]-((boardwidth+1)*row[2]);
						if(document.getElementById('div' + row[2] + col[2]).className!='blank')
						{
							checkset = [board[row[0]][col[0]], board[row[1]][col[1]], board[row[2]][col[2]]];
							if (compare(checkset))
							{
								return true;
							}
						}
					}
				}
			}
		}
	}
	return false;
}



function compare(threecards)
{
	for(trit=0;trit<=3;trit++)
	{
		if(ternaryxor(ternary(threecards[0])[trit], ternary(threecards[1])[trit], ternary(threecards[2])[trit]) == 1)
		{
			return false;
		}
	}
	return true;
}

function ternaryxor(a,b,c)
{
	if (a==b)
	{
		if (a==c) {
			return 0;
		} else {
			return 1;
		}
	} else if (b==c)
	{
		 return 1;
	 } else if (a==c)
	 {
		 return 1;
	 } else {
		 return 0;
	 }
			
}
function emptytheset()
{
	setsize=0;
	set[0]=['','','']; 	//the card
	set[1]=[0,0,0];		//its row
	set[2]=[0,0,0];		//its col
}
function clickmorecards()
{
	if(!gameover)
	{
		if(checkforsets())
		{
			extrarows = confirm('Are you sure? There are still legal groups of cards on the board.');
		} else {
			extrarows=true;
		}
		
		//now if extrarows=true deal another row; in other places check if it is, incl dealing blanks.
		if(extrarows)
		{
			for (col=0;col<=boardwidth;col++)
			{
				deal(boardheight+1,col);
			}
			document.getElementById('button').className='hidden';
		}
		
	}
}	

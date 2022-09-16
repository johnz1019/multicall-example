import {aggregate} from '@makerdao/multicall';
import {formatUnits} from 'ethers/lib/utils';

const config = {
  rpcUrl: 'https://node.wallet.unipass.id/polygon-mumbai',
  multicallAddress: '0x19Dd083836A59aEB351f263C169631b671e4706D',
};

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

async function getTokenBalances(account: string, tokens: string[]) {
  const calls = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === ADDRESS_ZERO) {
      calls.push({
        target: config.multicallAddress,
        call: ['getEthBalance(address)(uint256)', account],
        returns: [[`TOKEN_BALANCE_${i}`, (val: any) => val]],
      });
    } else {
      calls.push({
        target: tokens[i],
        call: ['symbol()(string)'],
        returns: [[`TOKEN_SYMBOL_${i}`, (val: any) => val]],
      });

      calls.push({
        target: tokens[i],
        call: ['decimals()(uint256)'],
        returns: [[`TOKEN_DECIMAL_${i}`, (val: any) => val]],
      });

      calls.push({
        target: tokens[i],
        call: ['balanceOf(address)(uint256)', account],
        returns: [[`TOKEN_BALANCE_${i}`, (val: any) => val]],
      });
    }
  }

  const {
    results: {transformed},
  } = await aggregate(calls, config);

  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    const symbol =
      tokens[i] === ADDRESS_ZERO ? 'ETH' : transformed[`TOKEN_SYMBOL_${i}`];
    const decimal =
      tokens[i] === ADDRESS_ZERO
        ? 18
        : Number(transformed[`TOKEN_DECIMAL_${i}`]);
    console.log(symbol, decimal);
    result.push({
      token: tokens[i],
      symbol: symbol,
      decimal: decimal,
      BALANCE: formatUnits(transformed[`TOKEN_BALANCE_${i}`], decimal),
    });
  }

  return result;
}

async function main() {
  const ret = await getTokenBalances(
    '0x7b5Bd7c9E3A0D0Ef50A9b3aCF5d1AcD58C3590d1',
    ['0xe0F0ffA1e897C566BC721353FF4C64FC8ACd77E0', ADDRESS_ZERO]
  );

  console.log('ret', ret);
}

main();

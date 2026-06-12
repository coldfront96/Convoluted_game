import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

const floorHP = (depth: number) => 8 + depth * 4;

type GameState = {
  tick: number;
  depth: number;
  enemyHp: number;
  power: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  shards: number;
};

export default function App() {
  const [game, setGame] = useState<GameState>({
    tick: 0,
    depth: 1,
    enemyHp: floorHP(1),
    power: 2,
    energy: 6,
    maxEnergy: 6,
    gold: 0,
    shards: 0,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setGame((prev) => {
        const next: GameState = { ...prev, tick: prev.tick + 1 };

        if (next.tick % 3 === 0 && next.energy < next.maxEnergy) {
          next.energy += 1;
        }

        if (next.energy > 0) {
          const damage = next.power + ((next.tick + next.depth) % 3);
          next.energy -= 1;
          next.enemyHp -= damage;
        }

        if (next.enemyHp <= 0) {
          const clearedDepth = next.depth;
          next.gold += 6 + clearedDepth * 2;
          if (clearedDepth % 5 === 0) {
            next.shards += 1;
          }
          next.depth += 1;
          next.enemyHp = floorHP(next.depth);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const train = () => {
    setGame((prev) => {
      if (prev.gold < 20) return prev;
      return { ...prev, gold: prev.gold - 20, power: prev.power + 1 };
    });
  };

  const deepenRest = () => {
    setGame((prev) => {
      if (prev.shards < 1) return prev;
      const maxEnergy = prev.maxEnergy + 1;
      return { ...prev, shards: prev.shards - 1, maxEnergy, energy: maxEnergy };
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echo Delves (Prototype)</Text>
      <Text style={styles.note}>
        Mobile idle dungeon starter. Original systems only. Free-to-play (no pay-to-win systems).
      </Text>

      <View style={styles.statsCard}>
        <Text style={styles.stat}>Depth: {game.depth}</Text>
        <Text style={styles.stat}>Enemy HP: {Math.max(0, game.enemyHp)}</Text>
        <Text style={styles.stat}>Power: {game.power}</Text>
        <Text style={styles.stat}>
          Energy: {game.energy}/{game.maxEnergy}
        </Text>
        <Text style={styles.stat}>Gold: {game.gold}</Text>
        <Text style={styles.stat}>Shards: {game.shards}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={train}>
          <Text style={styles.buttonText}>Train (+1 Power) · 20 Gold</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={deepenRest}>
          <Text style={styles.buttonText}>Deep Rest (+1 Max Energy) · 1 Shard</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111318',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: {
    color: '#f5f7ff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  note: {
    color: '#a8b0c4',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#1b1f2a',
    borderColor: '#2d3447',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 6,
  },
  stat: {
    color: '#f5f7ff',
    fontSize: 16,
  },
  actions: {
    gap: 10,
  },
  button: {
    backgroundColor: '#314979',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#f5f7ff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

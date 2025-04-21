"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Heart, Info, Zap, Swords, AlertCircle, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
  types: {
    type: {
      name: string
    }
  }[]
  stats: {
    base_stat: number
    stat: {
      name: string
    }
  }[]
  abilities: {
    ability: {
      name: string
    }
    is_hidden: boolean
  }[]
  moves: {
    move: {
      name: string
    }
  }[]
}

export default function PokeBella() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        // Fetch the first 20 Pokemon
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
        const data = await response.json()

        // Fetch details for each Pokemon
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon: { url: string }) => {
            const res = await fetch(pokemon.url)
            return res.json()
          }),
        )

        setPokemon(pokemonDetails)
      } catch (error) {
        console.error("Error fetching Pokemon:", error)
        setApiError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("pokebella-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const filteredPokemon = pokemon.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get pastel color based on Pokemon type
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      fire: "bg-red-200 text-red-700",
      water: "bg-blue-100 text-blue-700",
      grass: "bg-green-100 text-green-700",
      electric: "bg-yellow-100 text-yellow-700",
      psychic: "bg-purple-100 text-purple-700",
      ice: "bg-cyan-100 text-cyan-700",
      dragon: "bg-indigo-100 text-indigo-700",
      dark: "bg-gray-200 text-gray-700",
      fairy: "bg-pink-100 text-pink-700",
      normal: "bg-gray-100 text-gray-700",
      fighting: "bg-orange-100 text-orange-700",
      flying: "bg-sky-100 text-sky-700",
      poison: "bg-violet-100 text-violet-700",
      ground: "bg-amber-100 text-amber-700",
      rock: "bg-stone-100 text-stone-700",
      bug: "bg-lime-100 text-lime-700",
      ghost: "bg-violet-200 text-violet-700",
      steel: "bg-slate-100 text-slate-700",
    }

    return typeColors[type] || "bg-gray-100 text-gray-700"
  }

  const handlePokemonClick = (p: Pokemon) => {
    setSelectedPokemon(p)
    setIsDialogOpen(true)
  }

  const formatStatName = (name: string) => {
    switch (name) {
      case "hp":
        return "HP"
      case "attack":
        return "Attack"
      case "defense":
        return "Defense"
      case "special-attack":
        return "Sp. Atk"
      case "special-defense":
        return "Sp. Def"
      case "speed":
        return "Speed"
      default:
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  const formatName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to get high-quality Pokemon image
  const getPokemonImage = (pokemon: Pokemon) => {
    return (
      pokemon.sprites.other?.["official-artwork"]?.front_default ||
      pokemon.sprites.front_default ||
      `/placeholder.svg?height=200&width=200`
    )
  }

  const toggleFavorite = async (id: number) => {
    try {
      let newFavorites
      if (favorites.includes(id)) {
        newFavorites = favorites.filter((favId) => favId !== id)
        toast({
          title: "Removed from favorites",
          description: "Pokemon has been removed from your favorites",
          className: "bg-pink-50 border-pink-200 text-pink-700",
        })
      } else {
        newFavorites = [...favorites, id]
        toast({
          title: "Added to favorites",
          description: "Pokemon has been added to your favorites",
          className: "bg-pink-50 border-pink-200 text-pink-700",
        })
      }

      setFavorites(newFavorites)
      localStorage.setItem("pokebella-favorites", JSON.stringify(newFavorites))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 inline-flex items-center gap-2">
            <Sparkles className="text-pink-400" />
            PokeBella
            <Heart className="text-pink-400" />
          </h1>
          <p className="text-purple-400 mt-2 font-light">
            Discover your Pokémon match with the Pokebella Character Picker!
          </p>
        </div>

        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300" />
          <Input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-pink-200 focus:border-pink-300 focus:ring-pink-200 bg-white"
          />
        </div>

        {apiError && (
          <Alert className="mb-6 bg-pink-50 border-pink-200">
            <AlertCircle className="h-4 w-4 text-pink-500" />
            <AlertDescription className="text-pink-700">
              There was an issue loading Pokemon data. Some features might be limited.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-pink-100 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/2 bg-pink-100" />
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full bg-pink-100" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-16 bg-pink-100" />
                    <Skeleton className="h-6 w-16 bg-pink-100" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-full bg-pink-100" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredPokemon.length > 0 ? (
              filteredPokemon.map((p) => (
                <Card
                  key={p.id}
                  className="overflow-hidden hover:shadow-md transition-shadow border-pink-100 bg-white rounded-xl cursor-pointer"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
                    <CardTitle className="capitalize text-lg font-normal text-purple-600">{p.name}</CardTitle>
                    <span className="text-pink-400 text-sm">#{p.id.toString().padStart(3, "0")}</span>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center pt-4" onClick={() => handlePokemonClick(p)}>
                    <div className="bg-pink-50 rounded-full p-2 mb-4 h-40 w-40 flex items-center justify-center">
                      <div className="relative h-32 w-32 overflow-hidden">
                        <Image
                          src={getPokemonImage(p) || "/placeholder.svg"}
                          alt={p.name}
                          width={128}
                          height={128}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {p.types.map((type) => (
                        <Badge
                          key={type.type.name}
                          className={`${getTypeColor(type.type.name)} capitalize border-0 font-normal`}
                          variant="outline"
                        >
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center gap-1 text-sm border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                      onClick={() => handlePokemonClick(p)}
                    >
                      <Info className="w-4 h-4 mr-1" /> Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        favorites.includes(p.id)
                          ? "text-pink-500 hover:text-pink-700 hover:bg-pink-50"
                          : "text-pink-300 hover:text-pink-500 hover:bg-pink-50"
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(p.id)
                      }}
                    >
                      {favorites.includes(p.id) ? (
                        <Heart className="w-4 h-4 fill-current" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-xl border border-pink-100">
                <h3 className="text-xl font-normal text-purple-600">No Pokemon found</h3>
                <p className="text-pink-400 mt-2">Try a different search term</p>
                <Button
                  className="mt-4 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white border-0"
                  onClick={() => setSearchTerm("")}
                >
                  Show all Pokemon
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedPokemon && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl bg-white border-pink-200">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle className="text-2xl font-light capitalize text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  {selectedPokemon.name}{" "}
                  <span className="text-pink-400">#{selectedPokemon.id.toString().padStart(3, "0")}</span>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    favorites.includes(selectedPokemon.id)
                      ? "text-pink-500 hover:text-pink-700 hover:bg-pink-50"
                      : "text-pink-300 hover:text-pink-500 hover:bg-pink-50"
                  }
                  onClick={() => toggleFavorite(selectedPokemon.id)}
                >
                  {favorites.includes(selectedPokemon.id) ? (
                    <Heart className="w-5 h-5 fill-current" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </Button>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                  <div className="bg-pink-50 rounded-full p-4 mb-4 h-60 w-60 flex items-center justify-center">
                    <div className="relative h-48 w-48 overflow-hidden">
                      <Image
                        src={getPokemonImage(selectedPokemon) || "/placeholder.svg"}
                        alt={selectedPokemon.name}
                        width={192}
                        height={192}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {selectedPokemon.types.map((type) => (
                      <Badge
                        key={type.type.name}
                        className={`${getTypeColor(type.type.name)} capitalize border-0 font-normal`}
                        variant="outline"
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6 bg-gradient-to-r from-pink-100 to-purple-100">
                      <TabsTrigger
                        value="stats"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white"
                      >
                        <Info className="w-4 h-4 mr-1" /> Stats
                      </TabsTrigger>
                      <TabsTrigger
                        value="abilities"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white"
                      >
                        <Zap className="w-4 h-4 mr-1" /> Abilities
                      </TabsTrigger>
                      <TabsTrigger
                        value="moves"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white"
                      >
                        <Swords className="w-4 h-4 mr-1" /> Moves
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="space-y-4">
                      {selectedPokemon.stats.map((stat) => (
                        <div key={stat.stat.name} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-purple-600">
                              {formatStatName(stat.stat.name)}
                            </span>
                            <span className="text-sm text-pink-500">{stat.base_stat}</span>
                          </div>
                          <Progress
                            value={(stat.base_stat / 255) * 100}
                            className="h-2 bg-pink-100"
                            indicatorClassName={
                              stat.stat.name === "hp"
                                ? "bg-pink-400"
                                : stat.stat.name.includes("attack")
                                  ? "bg-red-300"
                                  : stat.stat.name.includes("defense")
                                    ? "bg-blue-300"
                                    : stat.stat.name === "speed"
                                      ? "bg-green-300"
                                      : "bg-purple-300"
                            }
                          />
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="abilities" className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {selectedPokemon.abilities.map((ability) => (
                          <div
                            key={ability.ability.name}
                            className="p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-between"
                          >
                            <span className="text-purple-600 font-medium capitalize">
                              {formatName(ability.ability.name)}
                            </span>
                            {ability.is_hidden && (
                              <Badge className="bg-pink-100 text-pink-700 border-0 font-normal">Hidden</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="moves" className="max-h-60 overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPokemon.moves.slice(0, 20).map((move) => (
                          <div
                            key={move.move.name}
                            className="p-2 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 text-purple-600 text-sm capitalize"
                          >
                            {formatName(move.move.name)}
                          </div>
                        ))}
                        {selectedPokemon.moves.length > 20 && (
                          <div className="p-2 rounded-lg bg-pink-100 text-pink-600 text-sm text-center col-span-2">
                            + {selectedPokemon.moves.length - 20} more moves
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

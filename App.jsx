import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Coffee, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import AddDishModal from '@/components/AddDishModal.jsx'
import './App.css'

const API_BASE_URL = 'https://restaurante-backend-production-c9b3.up.railway.app'

function App() {
  const [apiStatus, setApiStatus] = useState(null)
  const [cardapio, setCardapio] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estado para o painel admin
  const [adminPratos, setAdminPratos] = useState([])
  const [adminCategorias, setAdminCategorias] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState(null)

  // Função para buscar pratos (painel admin)
  const fetchAdminPratos = async () => {
    setAdminLoading(true)
    setAdminError(null)
    try {
      // Usa o endpoint público de cardápio para obter categorias e pratos
      const response = await fetch(`${API_BASE_URL}/api/cardapio`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      // Extrai todos os pratos e adiciona o id_categoria correspondente
      const pratos = (data.cardapio || []).flatMap((categoria) =>
        categoria.pratos.map((prato) => ({
          ...prato,
          id_categoria: categoria.id_categoria,
        }))
      )
      setAdminPratos(pratos)
    } catch (err) {
      setAdminError(`Erro ao buscar pratos: ${err.message}`)
    } finally {
      setAdminLoading(false)
    }
  }

  // Função para buscar categorias (painel admin)
  const fetchAdminCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categorias`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      // Ajuste de acordo com retorno da API: assume objeto { id_categoria, nome_categoria }
      setAdminCategorias(
        data.map((c) => ({ id: c.id_categoria || c.id, nome: c.nome_categoria || c.nome }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  // Função para testar status da API
  const testApiStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setApiStatus(data)
    } catch (err) {
      setError(`Erro ao conectar com a API: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar cardápio
  const fetchCardapio = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/cardapio`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setCardapio(data)
    } catch (err) {
      setError(`Erro ao buscar cardápio: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Testar API ao carregar
  useEffect(() => {
    testApiStatus()
    fetchCardapio()
    // Carregar dados do painel administrativo
    fetchAdminCategorias()
    fetchAdminPratos()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Manda Café</h1>
          </div>
          <p className="text-gray-600">Sistema de Gerenciamento de Cardápio</p>
        </div>

        {/* Status da API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status da API
            </CardTitle>
            <CardDescription>
              Conexão com o backend em produção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={testApiStatus} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Testar Conexão
              </Button>
              
              {apiStatus && (
                <Badge variant={apiStatus.status === 'OK' ? 'default' : 'destructive'}>
                  {apiStatus.status === 'OK' ? 'Conectado' : 'Erro'}
                </Badge>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {apiStatus && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {apiStatus.status}
                </div>
                <div>
                  <strong>Versão:</strong> {apiStatus.version}
                </div>
                <div>
                  <strong>Ambiente:</strong> {apiStatus.environment}
                </div>
                <div>
                  <strong>Banco:</strong> {apiStatus.database?.database}
                </div>
                <div>
                  <strong>ORM:</strong> {apiStatus.database?.orm}
                </div>
                <div>
                  <strong>Última Atualização:</strong> {new Date(apiStatus.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs para diferentes funcionalidades */}
        <Tabs defaultValue="cardapio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cardapio">Cardápio Público</TabsTrigger>
            <TabsTrigger value="admin">Painel Admin</TabsTrigger>
            <TabsTrigger value="testes">Testes de API</TabsTrigger>
          </TabsList>

          {/* Cardápio Público */}
          <TabsContent value="cardapio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cardápio do Restaurante</CardTitle>
                <CardDescription>
                  Visualização pública do cardápio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={fetchCardapio} 
                  disabled={loading}
                  className="mb-4"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar Cardápio
                </Button>

                {cardapio && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                      <div>
                        <strong>Total de Categorias:</strong> {cardapio.metadata?.total_categorias || 0}
                      </div>
                      <div>
                        <strong>Total de Pratos:</strong> {cardapio.metadata?.total_pratos || 0}
                      </div>
                      <div>
                        <strong>Última Atualização:</strong> {cardapio.metadata?.ultima_atualizacao ? new Date(cardapio.metadata.ultima_atualizacao).toLocaleTimeString() : 'N/A'}
                      </div>
                    </div>

                    {cardapio.cardapio && cardapio.cardapio.length > 0 ? (
                      <div className="grid gap-4">
                        {cardapio.cardapio.map((categoria) => (
                          <Card key={categoria.id_categoria}>
                            <CardHeader>
                              <CardTitle className="text-lg">{categoria.nome_categoria}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3">
                                {categoria.pratos.map((prato) => (
                                  <div key={prato.id_prato} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                      <h4 className="font-medium">{prato.nome_prato}</h4>
                                      <p className="text-sm text-gray-600">{prato.descricao}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg">R$ {prato.preco}</div>
                                      <Badge variant={prato.disponivel ? 'default' : 'secondary'}>
                                        {prato.disponivel ? 'Disponível' : 'Indisponível'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Nenhum prato encontrado no cardápio. O banco pode estar vazio ou os dados ainda não foram populados.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Painel Admin */}
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Painel Administrativo</CardTitle>
                <CardDescription>Gerencie seu cardápio</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Barra superior com título e botão para adicionar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="text-lg font-medium">Pratos cadastrados</div>
                  <AddDishModal categorias={adminCategorias} onSuccess={fetchAdminPratos} />
                </div>
                {/* Tabela de pratos */}
                {adminError && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}
                {adminLoading ? (
                  <div className="py-8 text-center text-sm text-gray-600">Carregando pratos...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Descrição</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Preço</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Disponível</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Categoria</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {adminPratos && adminPratos.length > 0 ? (
                          adminPratos.map((prato) => (
                            <tr key={prato.id_prato} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap">{prato.nome_prato}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {prato.descricao || '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">R$ {Number(prato.preco).toFixed(2)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <Badge variant={prato.disponivel ? 'default' : 'secondary'}>
                                  {prato.disponivel ? 'Sim' : 'Não'}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {adminCategorias.find((c) => c.id === prato.id_categoria)?.nome ||
                                  prato.id_categoria}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {prato.tipo_item || '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                              Nenhum prato encontrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testes de API */}
          <TabsContent value="testes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Testes de Endpoints</CardTitle>
                <CardDescription>
                  Teste todos os endpoints da API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <strong>Endpoints Disponíveis:</strong>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <code>/health</code>
                        <span className="text-gray-600">- Health check simples</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <code>/api/status</code>
                        <span className="text-gray-600">- Status completo da API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <code>/api/cardapio</code>
                        <span className="text-gray-600">- Cardápio público</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <code>/api/categorias</code>
                        <span className="text-gray-600">- Lista de categorias</span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>API Base URL:</strong> {API_BASE_URL}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

